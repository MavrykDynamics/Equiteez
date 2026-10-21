import { useMemo, type ReactNode } from "react";
import clsx from "clsx";

import { ROUTES } from "~/consts";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import useTippy from "~/lib/ui/useTippy";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";

import { useProfileForm } from "./hooks/useProfileForm";
import { GAS_PAYMENT_METHOD_OPTIONS } from "./profile.types";
import styles from "./styles.module.css";

// const DATE_PLACEHOLDER = "XX.XX.XXXX";

function Field({
  children,
  className,
  error,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string | null;
  label: string;
}) {
  return (
    <label className={clsx(styles.field, className)}>
      <RText size="body-sm">{label}</RText>
      {children}
      {error ? (
        <RText color="red-500" size="body-s">
          {error}
        </RText>
      ) : null}
    </label>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <RText size="body-m" weight="medium">
        {title}
      </RText>
      {children}
    </section>
  );
}

export default function PortfolioProfile() {
  const { userAddress } = useUserContext();
  const {
    values,
    // kyc,
    setField,
    emailError,
    touchEmail,
    isDirty,
    isSaving,
    save,
  } = useProfileForm();

  const copyTooltipRef = useTippy<HTMLButtonElement>(
    useMemo(
      () => ({
        animation: "shift-away-subtle",
        content: "Copy address",
        hideOnClick: false,
        placement: "top" as const,
        trigger: "mouseenter focus",
      }),
      []
    )
  );

  const selectedGasPaymentMethod = GAS_PAYMENT_METHOD_OPTIONS.find(
    (option) => option.id === values.gasPaymentMethod
  );

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioProfile} />

      <div className={styles.card}>
        <Section title="Profile Info">
          <div className={styles.grid}>
            <Field label="Full Name">
              <RInput
                autoComplete="name"
                onChange={(event) => setField("fullName", event.target.value)}
                placeholder="Full name"
                value={values.fullName}
              />
            </Field>
            <Field error={emailError} label="Email">
              <RInput
                aria-invalid={Boolean(emailError)}
                autoComplete="email"
                className={clsx(emailError && styles.inputError)}
                onBlur={touchEmail}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="Email"
                type="email"
                value={values.email}
              />
            </Field>
            <div className={styles.field}>
              <RText size="body-sm">Wallet Address</RText>
              <div className={styles.walletAddress}>
                <RText className={styles.walletAddressText} size="body-sm">
                  {userAddress ?? "-"}
                </RText>
                {userAddress ? (
                  <button
                    aria-label="Copy wallet address"
                    className={styles.copyButton}
                    onClick={() =>
                      void navigator.clipboard?.writeText(userAddress)
                    }
                    ref={copyTooltipRef}
                    type="button"
                  >
                    <RIcon name="copy" size="small" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Gas Payment">
          <div className={styles.gasPayment}>
            <Field className={styles.gasPaymentField} label="Payment Method">
              <RCustomDropdown className={styles.dropdown}>
                <RDropdownFaceContent className={styles.dropdownTrigger}>
                  {selectedGasPaymentMethod?.label}
                </RDropdownFaceContent>
                <RDropdownBodyContent aria-label="Payment method">
                  {GAS_PAYMENT_METHOD_OPTIONS.map((option) => (
                    <RDropdownBodyContentItem
                      isSelected={option.id === values.gasPaymentMethod}
                      key={option.id}
                      onClick={() => setField("gasPaymentMethod", option.id)}
                    >
                      {option.label}
                    </RDropdownBodyContentItem>
                  ))}
                </RDropdownBodyContent>
              </RCustomDropdown>
            </Field>
            <RButton
              disabled={!isDirty || Boolean(emailError)}
              isLoading={isSaving}
              onClick={save}
              size="medium"
              tone="black"
            >
              Save
            </RButton>
          </div>
        </Section>

        {/*<Section title="KYC Info">*/}
        {/*  <div className={styles.kycMessage}>*/}
        {/*    <RIcon name="check" size="small" />*/}
        {/*    <RText size="body-sm">*/}
        {/*      You successfully completed KYC verification on{" "}*/}
        {/*      {kyc.completedAt ?? DATE_PLACEHOLDER}. Thank you for verifying*/}
        {/*      your identity, and welcome to the platform!*/}
        {/*      <br />*/}
        {/*      Your KYC verification will need to be renewed on{" "}*/}
        {/*      {kyc.renewAt ?? DATE_PLACEHOLDER}.*/}
        {/*    </RText>*/}
        {/*  </div>*/}
        {/*</Section>*/}
      </div>
    </div>
  );
}
