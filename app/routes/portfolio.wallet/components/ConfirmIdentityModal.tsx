/**
 * "Confirm it's you": Dynamic asks for a fresh check before the private key
 * is shown or a passkey is added or removed, and its JavaScript SDK has no
 * screens. Shows the ways Dynamic accepts for this user (identityCheck.ts),
 * the recommended one first, the others one click away. No Figma for this
 * window yet: it follows the Wallet page modals and the sign-in code step.
 */
import { useEffect, useState, useSyncExternalStore } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
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
    <CustomPopup
      className={styles.modal}
      contentLabel="Confirm it's you"
      contentPosition="center"
      isOpen={Boolean(check)}
      onRequestClose={() => {
        if (!isBusy) check?.cancel();
      }}
      overlayClassName={styles.overlay}
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
    </CustomPopup>
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

  return (
    <>
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          disabled={isBusy}
          onClick={check.cancel}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Confirm It&apos;s You
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              We ask again before changes that protect your wallet.
            </RText>
          </div>
        </header>

        {active?.kind === "code" ? (
          <CodeMethod
            key={active.id}
            method={active}
            onBusy={onBusy}
            onCancel={check.cancel}
            onDone={check.done}
          />
        ) : null}
        {active?.kind === "passkey" ? (
          <PasskeyMethod
            key={active.id}
            method={active}
            onBusy={onBusy}
            onCancel={check.cancel}
            onDone={check.done}
          />
        ) : null}

        {others.length ? (
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
        ) : null}
      </div>
    </>
  );
}

type MethodProps<T extends IdentityMethod["kind"]> = {
  method: Extract<IdentityMethod, { kind: T }>;
  onBusy: (isBusy: boolean) => void;
  onCancel: () => void;
  onDone: () => void;
};

function CodeMethod({ method, onBusy, onCancel, onDone }: MethodProps<"code">) {
  const [code, setCode] = useState("");
  // The first way's code is emailed before the dialog opens
  const [sentTo, setSentTo] = useState(method.sentTo);
  const isSent = !method.send || sentTo !== null;
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }, "We couldn't send the code. Please try again.");

  const handleConfirm = () =>
    run(async () => {
      await method.verify(code);
      onDone();
    }, "We couldn't check the code. Please try again.");

  if (!isSent) {
    return (
      <>
        <RText color="neutral-700" size="body-sm">
          We&apos;ll email you a 6-digit code.
        </RText>
        {error ? (
          <RText className={styles.error} role="alert" size="body-sm">
            {error}
          </RText>
        ) : null}
        <Actions
          isWorking={isWorking}
          onCancel={onCancel}
          onConfirm={() => void handleSend()}
          confirmLabel="Send code"
        />
      </>
    );
  }

  return (
    <form
      className={styles.codeForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH) void handleConfirm();
      }}
    >
      <RText color="neutral-700" size="body-sm">
        {method.send ? (
          <>
            We sent a 6-digit code to <strong>{sentTo}</strong>.
          </>
        ) : (
          "Enter the 6-digit code from your authenticator app."
        )}
      </RText>
      <div className={styles.codeBlock}>
        <CodeInput invalid={Boolean(error)} onChange={setCode} value={code} />
        {error ? (
          <RText className={styles.error} role="alert" size="body-sm">
            {error}
          </RText>
        ) : null}
        {method.send ? (
          <button
            className={styles.textButton}
            disabled={isWorking}
            onClick={() => void handleSend()}
            type="button"
          >
            Resend code
          </button>
        ) : null}
      </div>
      <Actions
        confirmLabel="Confirm"
        isConfirmDisabled={code.length < CODE_LENGTH}
        isSubmit
        isWorking={isWorking}
        onCancel={onCancel}
      />
    </form>
  );
}

function PasskeyMethod({
  method,
  onBusy,
  onCancel,
  onDone,
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
    <>
      <RText color="neutral-700" size="body-sm">
        Your browser will ask for a passkey saved for this account.
      </RText>
      {error ? (
        <RText className={styles.error} role="alert" size="body-sm">
          {error}
        </RText>
      ) : null}
      <Actions
        confirmLabel={method.label}
        isWorking={isWorking}
        onCancel={onCancel}
        onConfirm={() => void handleRun()}
      />
    </>
  );
}

type ActionsProps = {
  confirmLabel: string;
  isWorking: boolean;
  isConfirmDisabled?: boolean;
  /** The confirm button submits the surrounding form */
  isSubmit?: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
};

function Actions({
  confirmLabel,
  isWorking,
  isConfirmDisabled = false,
  isSubmit = false,
  onCancel,
  onConfirm,
}: ActionsProps) {
  return (
    <div className={styles.actions}>
      <RButton
        className={styles.action}
        disabled={isWorking}
        onClick={onCancel}
        size="medium"
        tone="black"
        type="button"
        variant="secondary"
      >
        Cancel
      </RButton>
      <RButton
        className={styles.action}
        disabled={isConfirmDisabled || isWorking}
        isLoading={isWorking}
        onClick={onConfirm}
        size="medium"
        tone="black"
        type={isSubmit ? "submit" : "button"}
      >
        {confirmLabel}
      </RButton>
    </div>
  );
}
