import { useCallback, useEffect, useRef, useState } from "react";

import { type CreditsState, getCreditsBalanceStatus } from "./credits.utils";

// TODO: replace with credits balance from the API
const INITIAL_CREDITS: CreditsState = {
  balance: 20,
  freeCredits: 0,
  pendingAmount: null,
};

// TODO: replace with the user's USDT wallet balance
const MOCK_WALLET_BALANCE_USD = 172507.78;
const MOCK_CONFIRMATION_DELAY_MS = 3000;

export function useCredits() {
  const [credits, setCredits] = useState<CreditsState>(INITIAL_CREDITS);
  const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(confirmationTimeoutRef.current), []);

  const addCredits = useCallback(async (amount: number) => {
    // TODO: send the add credits transaction and track its confirmation
    setCredits((currentCredits) => ({
      ...currentCredits,
      pendingAmount: amount,
    }));

    clearTimeout(confirmationTimeoutRef.current);
    confirmationTimeoutRef.current = setTimeout(() => {
      setCredits((currentCredits) => ({
        ...currentCredits,
        balance: currentCredits.balance + amount,
        pendingAmount: null,
      }));
    }, MOCK_CONFIRMATION_DELAY_MS);
  }, []);

  return {
    ...credits,
    status: getCreditsBalanceStatus(credits),
    walletBalanceUsd: MOCK_WALLET_BALANCE_USD,
    addCredits,
  };
}
