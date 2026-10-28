import { useState } from "react";
import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import {
  signPreparedPermit,
  type PermitRuntime,
  type PreparedPermit,
} from "~/contracts/permit";
import styles from "./RPermitReview.module.css";

type SignedPermit = Awaited<ReturnType<typeof signPreparedPermit>>;
type Props = {
  prepared: PreparedPermit;
  runtime: PermitRuntime;
  beforeSign?: () => Promise<void>;
  onCancel: () => void;
  onSigned: (permit: SignedPermit) => void;
};

/** Key by prepared.payload when replacing a review. Does not submit or report transaction success. */
export function RPermitReview({
  prepared,
  runtime,
  onCancel,
  onSigned,
  beforeSign,
}: Props) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSign = async () => {
    if (isSigning || error) return;
    setIsSigning(true);
    try {
      await beforeSign?.();
      const signed = await signPreparedPermit(runtime, prepared);
      onSigned(signed);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign this permit. Close and review the action again."
      );
    } finally {
      setIsSigning(false);
    }
  };
  return (
    <PopupWithIcon
      isOpen
      contentLabel="Review gasless action"
      onRequestClose={() => {
        if (!isSigning) onCancel();
      }}
    >
      <section className={styles.review} aria-busy={isSigning}>
        <RHeading as="h2" size="h6">
          Review gasless action
        </RHeading>
        <RText size="body-sm">
          Review the details before your wallet asks you to sign. Signing
          authorizes this action; it does not confirm execution.
        </RText>
        <dl className={styles.fields}>
          {prepared.fields.map((field) => (
            <div className={styles.field} key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        {error && (
          <p role="alert" className={styles.error}>
            {error} Close this review and refresh before trying again.
          </p>
        )}
        <div className={styles.actions}>
          <RButton
            variant="secondary"
            tone="black"
            disabled={isSigning}
            onClick={onCancel}
          >
            Cancel
          </RButton>
          <RButton
            tone="black"
            disabled={isSigning || !!error}
            isLoading={isSigning}
            onClick={handleSign}
          >
            Sign permit
          </RButton>
        </div>
      </section>
    </PopupWithIcon>
  );
}
