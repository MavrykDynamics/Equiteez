import { useEffect, useRef, useState } from "react";
import { RButton } from "~/lib/atoms/RButton";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { readRefundPage, readRelayConfig, serviceFee } from "~/lib/refunds/api";
import {
  chunksFor,
  collectRefunds,
  formatUnits,
  receivedTotals,
  restoreRun,
  runKey,
  totals,
  unresolved,
  type Mode,
  type RefundRun,
} from "~/lib/refunds/model";
import { executeRun } from "~/lib/refunds/runner";
import {
  assertScope,
  createPorts,
  estimateChunks,
} from "~/lib/refunds/transport";
import {
  useFreshQueryInvalidation,
  FreshnessSource,
} from "~/lib/apis/rwa/freshness";

// Deployment enables new preparations after gas/bytes calibration. Existing
// persisted operations remain visible and trackable with the flag switched off.
const enabled = process.env.REFUND_ALL_ENABLED === "true";
const configuredSize = Number(process.env.REFUND_ALL_CHUNK_SIZE ?? "10");
const initialSize =
  Number.isInteger(configuredSize) &&
  configuredSize > 0 &&
  configuredSize <= 100
    ? configuredSize
    : 10;

export function AssetRefundAll({ asset }: { asset: string }) {
  const { dapp } = useWalletContext();
  const { userAddress } = useUserContext();
  const { isAuthenticated } = useAuthContext();
  const invalidate = useFreshQueryInvalidation();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const [run, setRun] = useState<RefundRun | null>(null),
    [mode, setMode] = useState<Mode>("credits");
  const [error, setError] = useState(""),
    [hash, setHash] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null),
    [maxSize, setMaxSize] = useState(initialSize);
  const context = useRef({
    wallet: userAddress,
    asset,
    authenticated: isAuthenticated,
  });
  context.current = {
    wallet: userAddress,
    asset,
    authenticated: isAuthenticated,
  };
  const alive = useRef(true),
    running = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    setRun(null);
    setError("");
    setRemaining(null);
    const restore = async () => {
      if (!dapp || !userAddress || !isAuthenticated || running.current) return;
      try {
        const chain = await dapp.tezos().rpc.getChainId();
        const raw = localStorage.getItem(runKey(userAddress, chain, asset));
        const saved = raw ? restoreRun(raw, userAddress, chain, asset) : null;
        if (!canceled) {
          setRun(saved);
          if (saved) setMode(saved.mode);
        }
      } catch {
        if (!canceled)
          setError(
            "Saved refund progress could not be loaded. Do not submit a replacement until previous transactions are checked."
          );
      }
    };
    void restore();
    const onStorage = () => {
      void restore();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      canceled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [dapp, userAddress, asset, isAuthenticated]);

  const save = (value: RefundRun) => {
    localStorage.setItem(
      runKey(value.wallet, value.chain, value.asset),
      JSON.stringify(value)
    );
    if (
      alive.current &&
      context.current.wallet === value.wallet &&
      context.current.asset === value.asset
    )
      setRun(structuredClone(value));
  };
  const locked = async (
    action: (wallet: string, chain: string) => Promise<void>
  ) => {
    if (!dapp || !userAddress || running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const chain = await dapp.tezos().rpc.getChainId();
      await assertScope(dapp, userAddress, chain);
      if (!navigator.locks)
        throw new Error(
          "This browser cannot safely coordinate wallet operations across tabs. Use a browser with Web Locks support."
        );
      await navigator.locks.request(
        runKey(userAddress, chain, asset),
        { ifAvailable: true },
        async (lock) => {
          if (!lock)
            throw new Error(
              "Refunds for this asset are already being processed in another tab."
            );
          await action(userAddress, chain);
        }
      );
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error
            ? e.message
            : "Refund request failed. Check the saved progress before retrying."
        );
    } finally {
      running.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const prepare = () =>
    locked(async (wallet, chain) => {
      if (!dapp || !enabled) return;
      const raw = localStorage.getItem(runKey(wallet, chain, asset));
      if (raw && unresolved(restoreRun(raw, wallet, chain, asset)))
        throw new Error(
          "Check the previous transaction before preparing a new refund."
        );
      const snapshot = await collectRefunds((cursor) =>
        readRefundPage(wallet, asset, cursor)
      );
      if (!snapshot.realtime)
        throw new Error(
          "The orderbook indexer is catching up. Refresh before signing."
        );
      const draft: RefundRun = {
        version: 1,
        wallet,
        chain,
        asset,
        mode,
        items: snapshot.items,
        chunks: chunksFor(snapshot.items, maxSize),
        feePerChunk: "0",
        feeToken: "",
        feeDecimals: 0,
      };
      if (mode === "credits") {
        const config = await readRelayConfig();
        if (!config.enabled)
          throw new Error(
            "Credits are unavailable. You can explicitly select MVRK and refresh."
          );
        for (const item of draft.items) {
          if (
            item.availability === "eligible" &&
            !config.contracts.some(
              (c) =>
                c.address === item.orderbook_address &&
                c.permitActions.includes("permitProcessRefund")
            )
          ) {
            item.availability = "blocked";
            item.blocked_reason = "credits_unavailable_for_orderbook";
          }
        }
        draft.chunks = chunksFor(draft.items, maxSize);
        draft.feePerChunk = serviceFee(config);
        draft.feeToken = config.fee.tokenContract ?? "";
        draft.feeDecimals = config.fee.decimals ?? 0;
      }
      draft.chunks = await estimateChunks(dapp, draft);
      totals(draft.items); // Reject inconsistent metadata before a review can be signed.
      await assertScope(dapp, wallet, chain);
      save(draft);
      setRemaining(null);
    });

  const resume = () =>
    locked(async (wallet, chain) => {
      if (!dapp) return;
      const raw = localStorage.getItem(runKey(wallet, chain, asset));
      if (!raw)
        throw new Error(
          "Refund progress was not saved. Refresh the list first."
        );
      const saved = restoreRun(raw, wallet, chain, asset);
      if (!enabled && !unresolved(saved))
        throw new Error("New refund operations are currently disabled.");
      if (saved.mode !== mode)
        throw new Error(
          "Payment method changed. Refresh the preview before confirming."
        );
      const unknown = saved.chunks.find((c) => c.state === "unknown");
      if (unknown && hash.trim()) {
        unknown.hash = hash.trim();
        save(saved);
      }
      await executeRun(
        saved,
        createPorts(
          dapp,
          saved,
          save,
          () =>
            alive.current &&
            context.current.wallet === wallet &&
            context.current.asset === asset &&
            context.current.authenticated
        ),
        enabled
      );
      const level = saved.chunks.reduce(
        (max, c) => Math.max(max, c.level ?? 0),
        0
      );
      await Promise.all(
        [
          "fetchWalletOpenOrders",
          "fetchWalletActivitySummary",
          "fetchWalletOrderHistory",
        ].map((key) =>
          invalidate(key, { level, source: FreshnessSource.Orderbook })
        )
      );
      const latest = await collectRefunds((cursor) =>
        readRefundPage(wallet, asset, cursor)
      );
      if (!latest.realtime || latest.level < level)
        throw new Error(
          "Transactions confirmed. Waiting for the full refund list to catch up."
        );
      setRemaining(latest.items.length);
    });

  if (!isAuthenticated || !userAddress || (!enabled && !run)) return null;
  const blocked = run?.items.filter((i) => i.availability === "blocked") ?? [];
  const amounts = run ? totals(run.items) : [];
  const received = run ? receivedTotals(run) : [];
  const confirmed =
    run?.chunks.filter((c) => c.state === "confirmed").length ?? 0;
  const pending = run ? unresolved(run) : false;
  const failed = run?.chunks.find((c) => c.state === "failed");
  const unknown = run?.chunks.some((c) => c.state === "unknown");
  const complete = Boolean(
    run?.chunks.length && confirmed === run.chunks.length
  );
  const resourceFailure =
    failed &&
    ["OPERATION_RESOURCE_LIMIT", "PAYLOAD_TOO_LARGE"].includes(
      failed.error ?? ""
    );

  return (
    <>
      <div className="flex justify-end py-3">
        <RButton
          variant="secondary"
          tone="black"
          size="small"
          onClick={() => setOpen(true)}
        >
          {pending ? "Refund progress" : "Claim all refunds"}
        </RButton>
      </div>
      <CustomPopup
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        contentLabel="Asset refunds"
        className="w-full max-w-xl max-h-[85vh] overflow-auto"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-medium">Claim available refunds</h2>
          <button
            type="button"
            aria-label="Close refunds"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-sm">
          Collect remaining balances from closed orders for this asset. Active
          orders keep running.
        </p>
        <label className="block mt-4 text-sm">
          Pay transaction costs with
          <select
            aria-label="Refund payment method"
            className="block border rounded p-2 mt-1"
            value={mode}
            disabled={busy || pending}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="credits">Credits</option>
            <option value="mvrk">MVRK</option>
          </select>
        </label>
        <div className="mt-4 flex gap-2">
          <RButton
            variant="secondary"
            tone="black"
            size="small"
            disabled={busy || pending || !enabled}
            onClick={prepare}
          >
            Refresh available refunds
          </RButton>
        </div>
        {run && (
          <div className="mt-4 text-sm" aria-live="polite">
            <p>
              {run.chunks.reduce((n, c) => n + c.orders.length, 0)} orders in{" "}
              {run.chunks.length} transaction parts.
            </p>
            <p>Available at preparation:</p>
            <ul className="my-2">
              {amounts.map((a) => (
                <li
                  key={`${a.token}:${a.id}`}
                  title={`${a.token} / token ${a.id}`}
                >
                  {formatUnits(a.units, a.decimals)} {a.symbol}
                </li>
              ))}
            </ul>
            <p>
              {run.mode === "mvrk"
                ? "Each part uses MVRK for network fees. The wallet shows the final fee before signing."
                : `Service fee: up to ${formatUnits(BigInt(run.feePerChunk) * BigInt(run.chunks.length), run.feeDecimals)} quote-token units from Credits; free allowances may reduce this.`}
            </p>
            {run.feeToken && (
              <p className="break-all text-xs">Fee token: {run.feeToken}</p>
            )}
            <p className="mt-2">
              {confirmed} of {run.chunks.length} parts confirmed and indexed.
              You may receive a wallet prompt for each part.
            </p>
            {confirmed > 0 && (
              <div className="mt-3">
                <p>Received in confirmed transactions:</p>
                {received.length ? (
                  <ul>
                    {received.map((p) => (
                      <li className="break-all" key={`${p.token}:${p.id}`}>
                        {p.decimals === null
                          ? `${p.units} raw units`
                          : formatUnits(BigInt(p.units), p.decimals)}{" "}
                        {p.symbol}{" "}
                        <span className="text-xs">
                          ({p.token}, token {p.id})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No token transfer was made. The balances may have already
                    been claimed.
                  </p>
                )}
              </div>
            )}
            {run.chunks.map((c, i) => (
              <p key={`${c.book}:${i}`} className="break-all text-xs mt-1">
                Part {i + 1}: {c.state}
                {c.hash
                  ? ` · ${c.hash}`
                  : c.operationId
                    ? ` · ${c.operationId}`
                    : ""}
              </p>
            ))}
            {blocked.length > 0 && (
              <details className="mt-3">
                <summary>{blocked.length} refunds unavailable</summary>
                <ul>
                  {blocked.map((i) => (
                    <li
                      key={`${i.orderbook_address}:${i.order_type}:${i.order_id}`}
                    >
                      Order {i.order_id} ({i.order_type}):{" "}
                      {i.blocked_reason?.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        {unknown && (
          <label className="block mt-3 text-sm">
            Transaction hash from your wallet (required to resolve an unknown
            result)
            <input
              className="block border p-2 w-full"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-red-600 text-sm mt-3">
            {error}
          </p>
        )}
        {resourceFailure && maxSize > 1 && (
          <RButton
            variant="secondary"
            tone="black"
            size="small"
            disabled={busy}
            onClick={() => {
              setMaxSize((n) => Math.max(1, Math.floor(n / 2)));
              setError(
                "Smaller parts selected. Refresh the preview and review the new transaction count before signing. Any returned service fee becomes available after your Credits balance updates."
              );
            }}
          >
            Use smaller parts
          </RButton>
        )}
        {resourceFailure && maxSize === 1 && (
          <p className="text-sm mt-3">
            A single refund still exceeds the limit. Contact support with the
            order and transaction details above.
          </p>
        )}
        {remaining !== null && (
          <p role="status" className="mt-3 text-sm">
            Prepared transactions confirmed.{" "}
            {remaining === 0
              ? "No remaining refunds were found."
              : `${remaining} remaining or newly available refunds found. Refresh to review them.`}
          </p>
        )}
        <div className="mt-5">
          <RButton
            tone="black"
            disabled={
              busy ||
              (!enabled && !pending) ||
              !run?.chunks.length ||
              !!failed ||
              complete ||
              run?.mode !== mode
            }
            isLoading={busy}
            onClick={resume}
          >
            {pending ? "Check saved progress" : "Confirm refunds"}
          </RButton>
        </div>
      </CustomPopup>
    </>
  );
}
