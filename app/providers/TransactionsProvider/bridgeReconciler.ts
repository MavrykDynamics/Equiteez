import type { BridgeDeposit } from "~/lib/apis/rwa/bridge/bridge.schema";
import type {
  BridgeTransactions,
  BridgeSettlementUpdate,
} from "./bridgeTransactions";

export const BRIDGE_POLL_INTERVAL = 20_000;
export const BRIDGE_POLL_LIMIT = 60;
type FetchDeposits = (
  wallet: string,
  signal: AbortSignal,
  fresh: boolean
) => Promise<BridgeDeposit[]>;

/** Session-scoped, single-flight reconciliation; never signs or submits. */
export class BridgeReconciler {
  private active = false;
  private generation = 0;
  private revision = 0;
  private remaining = BRIDGE_POLL_LIMIT;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private request: AbortController | undefined;
  private queued = false;
  private connected = false;
  constructor(
    private store: BridgeTransactions,
    private fetchDeposits: FetchDeposits,
    private isBound: boolean,
    private onSettlement: (records: BridgeSettlementUpdate[]) => void,
    private isCurrent: () => boolean = () => true
  ) {}
  start() {
    this.active = true;
    this.store.restore();
    this.refresh();
  }
  stop() {
    this.active = false;
    this.generation++;
    this.request?.abort();
    this.request = undefined;
    this.queued = false;
    clearTimeout(this.timer);
  }
  setConnected(connected: boolean) {
    const changed = this.connected !== connected;
    this.connected = connected;
    if (changed) this.refresh();
  }
  refresh = () => {
    if (!this.active || !this.isCurrent()) return;
    if (!this.isBound) {
      this.store.markStale(
        "Backend settlement is unverified: the API deployment has no matching bridge network binding."
      );
      return;
    }
    this.remaining = BRIDGE_POLL_LIMIT;
    this.revision++;
    clearTimeout(this.timer);
    if (this.request) {
      this.queued = true;
      return;
    }
    void this.run();
  };
  private async run() {
    if (!this.active || !this.isCurrent()) return;
    const generation = this.generation;
    const revision = this.revision;
    const request = new AbortController();
    this.request = request;
    let hasError = false;
    const current = () =>
      this.active &&
      this.isCurrent() &&
      generation === this.generation &&
      !request.signal.aborted;
    try {
      const rows = await this.fetchDeposits(
        this.store.account,
        request.signal,
        !this.connected
      );
      if (!current() || revision !== this.revision) return;
      const records = this.store.reconcile(rows);
      if (records.length) this.onSettlement(records);
    } catch {
      hasError = true;
      if (current() && revision === this.revision)
        this.store.markStale(
          "Bridge status is unavailable. The last known state is retained; no transaction was resubmitted."
        );
    } finally {
      if (current()) {
        this.request = undefined;
        if (this.queued) {
          this.queued = false;
          void this.run();
        } else if (
          this.store.hasPending() ||
          (hasError && !this.store.getSnapshot().transactions.size)
        ) {
          if (--this.remaining > 0)
            this.timer = setTimeout(
              () => void this.run(),
              BRIDGE_POLL_INTERVAL
            );
          else
            this.store.markStale(
              "Automatic status checks paused. Reconnect, return to this tab, or refresh status to resume."
            );
        }
      }
    }
  }
}
