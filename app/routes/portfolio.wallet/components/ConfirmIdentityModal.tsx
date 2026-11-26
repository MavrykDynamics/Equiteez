/**
 * "Confirm it's you": Dynamic asks for a fresh check before the private key
 * is shown or a passkey is added or removed, and its JavaScript SDK has no
 * screens. Shows the ways Dynamic accepts for this user (identityCheck.ts),
 * the recommended one first, the others one click away. Figma 8568:82275
 * "Security – Passkey. Verify" (the same window for the private key).
 */
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { RText } from "~/lib/atoms/RTypography/RText";
import {
  DynamicSessionExpiredError,
  DynamicWrongCodeError,
  isPasskeyPromptDismissed,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import {
  getPendingIdentityCheck,
  subscribeToIdentityCheck,
  type IdentityMethod,
  type PendingIdentityCheck,
} from "~/providers/WalletProvider/dynamic/identityCheck";
import {
  CODE_LENGTH,
  CodeInput,
} from "~/templates/ConnectWalletModal/CodeInput";

import styles from "./WalletModal.module.css";
import {
  WalletModal,
  WalletModalActions,
  WalletModalError,
  WalletModalHeader,
} from "./WalletModalParts";

const TITLE = "Verify Your Identity";
const RESEND_COOLDOWN_SECONDS = 30;

const getServerSnapshot = () => null;

export function ConfirmIdentityModal() {
  const check = useSyncExternalStore(
    subscribeToIdentityCheck,
    getPendingIdentityCheck,
    getServerSnapshot
  );

  // Leaving the page mid-check cancels it: a check left open would block
  // every later one, and finishing it on return would resume a stale action
  useEffect(() => () => getPendingIdentityCheck()?.cancel(), []);

  // While a code or passkey is being checked, the overlay and Escape don't
  // close the dialog (the close button is off too)
  const [isBusy, setIsBusy] = useState(false);

  return (
    <WalletModal
      isIdentityCheck
      isOpen={Boolean(check)}
      label="Verify your identity"
      onRequestClose={() => {
        if (!isBusy) check?.cancel();
      }}
    >
      {/* Keyed by the request: every check starts on its first way */}
      {check ? (
        <ConfirmIdentityContent
          check={check}
          isBusy={isBusy}
          key={methodsKey(check)}
          onBusy={setIsBusy}
        />
      ) : null}
    </WalletModal>
  );
}

const methodsKey = (check: PendingIdentityCheck) =>
  check.methods.map((method) => method.id).join("|");

function ConfirmIdentityContent({
  check,
  isBusy,
  onBusy,
}: {
  check: PendingIdentityCheck;
  isBusy: boolean;
  onBusy: (isBusy: boolean) => void;
}) {
  const [activeId, setActiveId] = useState(check.methods[0]?.id);

  // A check that ends mid-way leaves the dialog free for the next one
  useEffect(() => () => onBusy(false), [onBusy]);
  const active =
    check.methods.find((method) => method.id === activeId) ?? check.methods[0];
  const others = check.methods.filter((method) => method.id !== active?.id);

  // The other ways Dynamic accepts, under the buttons
  const otherWays = others.length ? (
    <div className={styles.otherWays}>
      {others.map((method) => (
        <button
          className={styles.textButton}
          disabled={isBusy}
          key={method.id}
          onClick={() => setActiveId(method.id)}
          type="button"
        >
          {method.label}
        </button>
      ))}
    </div>
  ) : null;

  if (active?.kind === "code") {
    return (
      <CodeMethod
        key={active.id}
        method={active}
        onBusy={onBusy}
        onCancel={check.cancel}
        onDone={check.done}
        otherWays={otherWays}
      />
    );
  }

  if (active?.kind === "passkey") {
    return (
      <PasskeyMethod
        key={active.id}
        method={active}
        onBusy={onBusy}
        onCancel={check.cancel}
        onDone={check.done}
        otherWays={otherWays}
      />
    );
  }

  return null;
}

type MethodProps<T extends IdentityMethod["kind"]> = {
  method: Extract<IdentityMethod, { kind: T }>;
  onBusy: (isBusy: boolean) => void;
  onCancel: () => void;
  onDone: () => void;
  otherWays: ReactNode;
};

/** Seconds left before the code can be sent again, ticking down */
function useResendCountdown() {
  const [availableAt, setAvailableAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (availableAt <= now) return;

    const timer = window.setTimeout(() => setNow(Date.now()), 1000);
    return () => window.clearTimeout(timer);
  }, [availableAt, now]);

  return {
    seconds: Math.max(0, Math.ceil((availableAt - now) / 1000)),
    restart: () => {
      const start = Date.now();
      setNow(start);
      setAvailableAt(start + RESEND_COOLDOWN_SECONDS * 1000);
    },
  };
}

/** 24 → "0:24" */
const formatCountdown = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;

function CodeMethod({
  method,
  onBusy,
  onCancel,
  onDone,
  otherWays,
}: MethodProps<"code">) {
  const [code, setCode] = useState("");
  // The first way's code is emailed before the dialog opens
  const [sentTo, setSentTo] = useState(method.sentTo);
  const isSent = !method.send || sentTo !== null;
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resend = useResendCountdown();

  // A code emailed before the dialog opened starts the countdown too
  useEffect(() => {
    if (method.send && method.sentTo !== null) resend.restart();
    // Once per way
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (task: () => Promise<void>, fallback: string) => {
    setIsWorking(true);
    onBusy(true);
    setError(null);

    try {
      await task();
    } catch (taskError) {
      // A wrong code and an expired sign-in say so; anything else (e.g. no
      // connection) is not blamed on the code
      setError(
        taskError instanceof DynamicWrongCodeError ||
          taskError instanceof DynamicSessionExpiredError
          ? taskError.message
          : fallback
      );
    } finally {
      setIsWorking(false);
      onBusy(false);
    }
  };

  const handleSend = () =>
    run(async () => {
      if (!method.send) return;
      setSentTo(await method.send());
      setCode("");
      resend.restart();
    }, "We couldn't send the code. Please try again.");

  const handleConfirm = () =>
    run(async () => {
      await method.verify(code);
      onDone();
    }, "We couldn't check the code. Please try again.");

  if (!isSent) {
    return (
      <div className={styles.content}>
        <WalletModalHeader
          description="We'll email you a 6-digit code."
          isDisabled={isWorking}
          onClose={onCancel}
          title={TITLE}
        />
        <WalletModalError message={error} />
        <WalletModalActions
          confirmLabel="Send Code"
          isWorking={isWorking}
          onCancel={onCancel}
          onConfirm={() => void handleSend()}
        />
        {otherWays}
      </div>
    );
  }

  return (
    <form
      className={styles.content}
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH) void handleConfirm();
      }}
    >
      <WalletModalHeader
        description={
          method.send ? (
            <>
              We sent a 6-digit code to <RText size="body-sm">{sentTo}</RText>
            </>
          ) : (
            "Enter the 6-digit code from your authenticator app."
          )
        }
        isDisabled={isWorking}
        onBack={onCancel}
        onClose={onCancel}
        title={TITLE}
      />
      <div className={styles.codeBlock}>
        <CodeInput invalid={Boolean(error)} onChange={setCode} value={code} />
        <WalletModalError message={error} />
      </div>
      {method.send ? (
        <div className={styles.resendRow}>
          {resend.seconds > 0 ? (
            <RText color="neutral-700" size="body-sm">
              Resend code in {formatCountdown(resend.seconds)}
            </RText>
          ) : (
            <button
              className={styles.textButton}
              disabled={isWorking}
              onClick={() => void handleSend()}
              type="button"
            >
              Resend code
            </button>
          )}
        </div>
      ) : null}
      <WalletModalActions
        confirmLabel="Confirm"
        isConfirmDisabled={code.length < CODE_LENGTH}
        isSubmit
        isWorking={isWorking}
        onCancel={onCancel}
      />
      {otherWays}
    </form>
  );
}

function PasskeyMethod({
  method,
  onBusy,
  onCancel,
  onDone,
  otherWays,
}: MethodProps<"passkey">) {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsWorking(true);
    onBusy(true);
    setError(null);

    try {
      await method.run();
      onDone();
    } catch (runError) {
      if (!isPasskeyPromptDismissed(runError)) {
        setError("We couldn't check your passkey. Please try again.");
      }
    } finally {
      setIsWorking(false);
      onBusy(false);
    }
  };

  return (
    <div className={styles.content}>
      <WalletModalHeader
        description="Your browser will ask for a passkey saved for this account."
        isDisabled={isWorking}
        onClose={onCancel}
        title={TITLE}
      />
      <WalletModalError message={error} />
      <WalletModalActions
        confirmLabel={method.label}
        isWorking={isWorking}
        onCancel={onCancel}
        onConfirm={() => void handleRun()}
      />
      {otherWays}
    </div>
  );
}
