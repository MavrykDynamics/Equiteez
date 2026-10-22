import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { KycInfo, ProfileFormValues } from "../profile.types";

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
  useEffect(() => {
    setValues({ ...INITIAL_VALUES, gasPaymentMethod: payment.method });
    setIsEmailTouched(false);
  }, [payment.scope, payment.method, payment.isRestored]);
  const [kyc] = useState<KycInfo>(INITIAL_KYC);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    payment.isRestored &&
    (!payment.isExplicit ||
      values.gasPaymentMethod !== payment.method ||
      Boolean(payment.error));
  const save = () => {
    setIsSaving(true);
    try {
      payment.save(values.gasPaymentMethod);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    values,
    saveError: payment.error,
    retryNetwork: payment.retryNetwork,
    kyc,
    setField,
    emailError: isEmailTouched ? emailError : null,
    touchEmail: () => setIsEmailTouched(true),
    isDirty,
    isSaving,
    save,
  };
}
