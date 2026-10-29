import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GAS_PAYMENT_METHOD_OPTIONS,
  type KycInfo,
  type ProfileFormValues,
} from "../profile.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO: replace with profile data from the API
const INITIAL_VALUES: ProfileFormValues = {
  fullName: "",
  email: "",
  gasPaymentMethod: "credits",
};

const INITIAL_KYC: KycInfo = {
  completedAt: null,
  renewAt: null,
};

export const validateEmail = (email: string) => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) return null;

  return EMAIL_REGEX.test(trimmedEmail) ? null : "Enter a valid email address";
};

export function useProfileForm() {
  const [values, setValues] = useState<ProfileFormValues>(INITIAL_VALUES);
  const payment = useGasPayment();
  const { success } = useToasterContext();
  useEffect(() => {
    setValues(INITIAL_VALUES);
    setIsEmailTouched(false);
  }, [payment.wallet]);
  // A new server version (own Save, reload after conflict, another device) replaces the draft.
  useEffect(() => {
    setValues((currentValues) => ({
      ...currentValues,
      gasPaymentMethod: payment.method,
    }));
  }, [payment.wallet, payment.method, payment.version, payment.isRestored]);
  const [kyc] = useState<KycInfo>(INITIAL_KYC);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const setField = useCallback(
    <K extends keyof ProfileFormValues>(
      field: K,
      value: ProfileFormValues[K]
    ) => {
      setValues((currentValues) => ({ ...currentValues, [field]: value }));
    },
    []
  );

  const emailError = useMemo(() => validateEmail(values.email), [values.email]);
  const isDirty =
    payment.isRestored && values.gasPaymentMethod !== payment.method;
  const save = async () => {
    // Save stays clickable; an unchanged choice sends nothing.
    if (!isDirty) return;
    const method = values.gasPaymentMethod;
    // Failures are shown inline under the form; only a stored choice is toasted.
    if (!(await payment.save(method))) return;
    const label = GAS_PAYMENT_METHOD_OPTIONS.find(
      (option) => option.id === method
    )?.label;
    success("Payment method saved", `Gas fees will be paid with ${label}.`);
  };

  return {
    values,
    saveError: payment.error,
    errorAction: payment.errorAction,
    needsSignIn: payment.needsSignIn,
    reload: payment.reload,
    retryNetwork: payment.retryNetwork,
    kyc,
    setField,
    emailError: isEmailTouched ? emailError : null,
    touchEmail: () => setIsEmailTouched(true),
    isDirty,
    isSaving: payment.isSaving,
    save,
  };
}
