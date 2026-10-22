import { NEXUS_LINK } from "~/consts/links.const";
import { useRef, useState } from "react";
import { RButton } from "~/lib/atoms/RButton/RButton";
import {
  useRelay,
  relayOutcomeText,
} from "~/providers/RelayProvider/RelayProvider";
import { isStillProcessing } from "~/lib/relay/relay.state";
import styles from "./RRelayProgress.module.css";

export function RRelayProgress() {
  const { lifecycle, records, error } = useRelay();
  const latestOwner = useRef(lifecycle);
  latestOwner.current = lifecycle;
  const [action, setAction] = useState<{
    owner: typeof lifecycle;
    error: string | null;
    busy: boolean;
  }>({ owner: null, error: null, busy: false });
  const actionError = action.owner === lifecycle ? action.error : null;
  const busy = action.owner === lifecycle && action.busy;
  const handleAction = async (action: () => Promise<unknown>) => {
    setAction({ owner: lifecycle, busy: true, error: null });
    try {
      await action();
    } catch (failure) {
      if (latestOwner.current === lifecycle)
        setAction({
          owner: lifecycle,
          busy: false,
          error:
            failure instanceof Error
              ? failure.message
              : "Recovery failed. Try Check now.",
        });
    } finally {
      if (latestOwner.current === lifecycle)
        setAction((previous) => ({ ...previous, busy: false }));
    }
  };
  const visible = records.filter((record) => !record.dismissed);
  if (!visible.length && !error) return null;
  return (
    <aside className={styles.host} aria-label="Relay activity">
      {(error || actionError) && (
        <p role="alert" className={styles.card}>
          {actionError ?? error}
        </p>
      )}
      {visible.map((record) => {
        const row = record.row;
        const terminal = record.state === "settled";
        const status = terminal
          ? row
            ? relayOutcomeText(row)
            : (record.error ??
              "Request ended. Review again before another action.")
          : isStillProcessing(record.createdAt, Date.now())
            ? "Still processing"
            : record.operationId
              ? "Relaying transaction"
              : "Submission outcome unknown";
        return (
          <section
            className={styles.card}
            key={record.id}
            aria-label="Relay transaction"
          >
            <p className={styles.status} role="status">
              {status}
            </p>
            <div className={styles.actions}>
              <RButton
                size="small"
                variant="secondary"
                onClick={() => lifecycle?.present(record.id, !record.minimized)}
                aria-expanded={!record.minimized}
              >
                {record.minimized ? "Details" : "Minimize"}
              </RButton>
              {terminal && (
                <RButton
                  size="small"
                  variant="secondary"
                  onClick={() => lifecycle?.present(record.id, true, true)}
                >
                  Dismiss
                </RButton>
              )}
            </div>
            {!record.minimized && (
              <div className={styles.details}>
                <dl>
                  <dt>Payment method</dt>
                  <dd>Credits</dd>
                  <dt>Action</dt>
                  <dd>
                    {(
                      row?.intentKind ??
                      record.intent?.kind ??
                      "Recovering action"
                    ).replaceAll("_", " ")}
                  </dd>
                  <dt>Contract</dt>
                  <dd>{record.contract}</dd>
                  <dt>Operation ID</dt>
                  <dd>{record.operationId ?? "Awaiting acknowledgment"}</dd>
                  {row?.opHash && (
                    <>
                      <dt>Transaction hash</dt>
                      <dd>
                        <a
                          href={`${NEXUS_LINK}/explorer/operation/${encodeURIComponent(row.opHash)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.opHash}
                        </a>
                      </dd>
                    </>
                  )}
                  {terminal && row?.feeChargedUnits !== undefined && (
                    <>
                      <dt>Service fee</dt>
                      <dd>
                        {row.feeChargedUnits === null
                          ? "No service fee retained"
                          : `${row.feeChargedUnits} raw quote-token units retained`}
                      </dd>
                    </>
                  )}
                </dl>
                {!terminal && (
                  <p>
                    Tracking continues when minimized. Do not send this action
                    again through another payment method.
                  </p>
                )}
                {(record.error || row?.error) && (
                  <p role="alert">
                    {row?.error?.message ?? record.error}
                    {record.remedy === "sign-in"
                      ? " Sign in again before recovery."
                      : ""}
                  </p>
                )}
                <div className={styles.actions}>
                  <RButton
                    size="small"
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      handleAction(() =>
                        record.operationId
                          ? lifecycle!.refresh(record.operationId, true)
                          : lifecycle!.reconcile()
                      )
                    }
                  >
                    Check now
                  </RButton>
                  {!record.operationId &&
                    record.payload &&
                    record.state === "unknown" &&
                    record.posts < 4 && (
                      <RButton
                        size="small"
                        disabled={busy || Date.now() < record.nextRetryAt}
                        onClick={() =>
                          handleAction(() => lifecycle!.retry(record.id))
                        }
                      >
                        Retry same request
                      </RButton>
                    )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </aside>
  );
}
