interface DodoMavParams {
  i: number; // Guide price
  k: number; // Curve slippage factor
  B: number; // Current base token supply
  B0: number; // Target base token supply
  Q: number; // Current quote token supply
  Q0: number; // Target quote token supply
}

function calculateR(params: DodoMavParams, isBaseToken: boolean): number {
  const { k, B, B0, Q, Q0 } = params;

  if (isBaseToken) {
    // Calculate R for base tokens
    if (B < B0) {
      return 1 - k + Math.pow(B0 / B, 2) * k;
    }
  } else {
    // Calculate R for quote tokens
    if (Q < Q0) {
      return 1 / (1 - k + Math.pow(Q0 / Q, 2) * k);
    }
  }

  // Default R
  return 1;
}

function calculatePrice(params: DodoMavParams, isBaseToken: boolean): number {
  const R = calculateR(params, isBaseToken);
  return params.i * R;
}

export function calculateBuyPrice(
  amount: number,
  params: DodoMavParams
): number {
  const price = calculatePrice(params, true);
  return price * amount; // Total cost in quote tokens
}

export function calculateSellPrice(
  amount: number,
  params: DodoMavParams
): number {
  const price = calculatePrice(params, true);
  return price * amount; // Total received in quote tokens
}
