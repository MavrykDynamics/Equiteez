import { z } from "zod";

const removalSchema = z.record(
  z.union([z.number().finite().nonnegative(), z.null()])
);
type RemovalSnapshot = {
  /** null is a removal marker; a number is a WSS-confirmed success deadline. */
  entries: ReadonlyMap<string, number | null>;
  storageError: string | null;
  isReady: boolean;
};

/** Presentation persistence only. Never mutates canonical transaction tracking. */
export class WidgetRemovals {
  private snapshot: RemovalSnapshot = {
    entries: new Map(),
    storageError: null,
    isReady: false,
  };
  private listeners = new Set<() => void>();
  private timer?: ReturnType<typeof setTimeout>;
  private canPersist = true;
  private isStarted = false;
  private readonly key: string | null;

  constructor(
    account: string | null,
    network: string,
    private readonly storage: () => Pick<Storage, "getItem" | "setItem">
  ) {
    this.key = account
      ? `equiteez:bridge-widgets:v1:${encodeURIComponent(network)}:${encodeURIComponent(account)}`
      : null;
  }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private read() {
    const raw = this.key ? this.storage().getItem(this.key) : null;
    return new Map(
      Object.entries(raw ? removalSchema.parse(JSON.parse(raw)) : {})
    );
  }

  private publish(
    entries: ReadonlyMap<string, number | null>,
    storageError: string | null
  ) {
    this.snapshot = { entries, storageError, isReady: true };
    this.listeners.forEach((listener) => listener());
  }

  start = () => {
    this.isStarted = true;
    if (!this.snapshot.isReady) {
      try {
        this.publish(this.read(), null);
      } catch {
        // Preserve unreadable data instead of replacing it with an empty history.
        this.canPersist = false;
        this.publish(
          new Map(),
          "Widget removal history could not be read. Dismissals are session-only."
        );
      }
    }
    this.expire();
  };

  stop = () => {
    this.isStarted = false;
    clearTimeout(this.timer);
    this.timer = undefined;
  };

  private save(entries: Map<string, number | null>) {
    let error = this.snapshot.storageError;
    if (this.key && this.canPersist) {
      try {
        // Preserve other tabs' removals and the earliest success deadline.
        for (const [id, deadline] of this.read()) {
          const current = entries.get(id);
          entries.set(
            id,
            current === null || deadline === null
              ? null
              : current === undefined
                ? deadline
                : Math.min(current, deadline)
          );
        }
        this.storage().setItem(
          this.key,
          JSON.stringify(Object.fromEntries(entries))
        );
        error = null;
      } catch {
        error =
          "Widget removal history could not be saved. Dismissals may reappear after reload.";
      }
    }
    this.publish(entries, error);
    this.schedule();
  }

  confirmSuccess(id: string) {
    if (!this.isStarted || this.snapshot.entries.has(id)) return;
    this.save(new Map(this.snapshot.entries).set(id, Date.now() + 5_000));
  }

  dismiss(id: string) {
    if (!this.isStarted || this.snapshot.entries.get(id) === null) return;
    this.save(new Map(this.snapshot.entries).set(id, null));
  }

  expire = () => {
    if (!this.isStarted) return;
    const entries = new Map(this.snapshot.entries);
    let changed = false;
    for (const [id, deadline] of entries) {
      if (deadline !== null && deadline <= Date.now()) {
        entries.set(id, null);
        changed = true;
      }
    }
    if (changed) this.save(entries);
    else this.schedule();
  };

  private schedule() {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (!this.isStarted) return;
    const deadlines = [...this.snapshot.entries.values()].filter(
      (value): value is number => value !== null
    );
    if (deadlines.length)
      this.timer = setTimeout(
        this.expire,
        Math.max(0, Math.min(...deadlines) - Date.now())
      );
  }
}
