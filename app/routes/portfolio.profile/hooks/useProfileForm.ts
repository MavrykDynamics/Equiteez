import { useCallback, useMemo, useState } from "react";

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
  const [savedValues, setSavedValues] =
    useState<ProfileFormValues>(INITIAL_VALUES);
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
  const isDirty = useMemo(
    () =>
      (Object.keys(values) as (keyof ProfileFormValues)[]).some(
        (field) => values[field] !== savedValues[field]
      ),
    [savedValues, values]
  );

  const save = useCallback(async () => {
    setIsEmailTouched(true);

    if (emailError) return;

    setIsSaving(true);

    try {
      // TODO: send `values` to the API
      setSavedValues(values);
    } finally {
      setIsSaving(false);
    }
  }, [emailError, values]);

  return {
    values,
    kyc,
    setField,
    emailError: isEmailTouched ? emailError : null,
    touchEmail: () => setIsEmailTouched(true),
    isDirty,
    isSaving,
    save,
  };
}
