import { BigNumber } from "bignumber.js";
import { decimalScale, toPositiveNatString } from "~/lib/utils/formaters";
import { alignQuantityAtomsToTick } from "~/lib/orderbook/orderbookTick";

export type OrderPayloadParams = {
  rwaTokenAmount: BigNumber.Value;
  pricePerRwaToken: BigNumber.Value;
  currency: string;
  orderExpiry: string | null;
  isMarketOrder: boolean;
  baseTokenDecimals?: number;
  tickSizeAtoms?: BigNumber.Value;
  quantityTickSizeAtoms?: BigNumber.Value;
  minRwaTokenAmount?: BigNumber.Value;
  minQuoteValue?: BigNumber.Value;
};

/** Shared raw order validation; does not round inputs or construct a permit. */
export function buildOrderPayload(params: OrderPayloadParams) {
  const payload = normalizeOrderPayload(params);
  validateOrderRules(params);
  return payload;
}

const assertCurrency = (value: string) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error("Order currency key is required");
  }
};

const assertOrderExpiry = (value: string | null) => {
  if (value === null) return;

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Order expiry must be null or a valid timestamp");
  }
};

const normalizeOrderPayload = ({
  rwaTokenAmount,
  pricePerRwaToken,
  currency,
  orderExpiry,
  isMarketOrder,
}: Pick<
  OrderPayloadParams,
  | "rwaTokenAmount"
  | "pricePerRwaToken"
  | "currency"
  | "orderExpiry"
  | "isMarketOrder"
>) => {
  assertCurrency(currency);
  assertOrderExpiry(orderExpiry);

  return {
    rwaTokenAmount: toPositiveNatString(rwaTokenAmount, "RWA token amount"),
    pricePerRwaToken: toPositiveNatString(
      pricePerRwaToken,
      "Price per RWA token"
    ),
    currency: currency.trim(),
    orderExpiry,
    isMarketOrder,
  };
};

const validateOrderRules = ({
  rwaTokenAmount,
  pricePerRwaToken,
  isMarketOrder,
  baseTokenDecimals,
  tickSizeAtoms,
  quantityTickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: Pick<
  OrderPayloadParams,
  | "rwaTokenAmount"
  | "pricePerRwaToken"
  | "isMarketOrder"
  | "baseTokenDecimals"
  | "tickSizeAtoms"
  | "quantityTickSizeAtoms"
  | "minRwaTokenAmount"
  | "minQuoteValue"
>) => {
  const amountAtoms = new BigNumber(rwaTokenAmount);
  const priceAtoms = new BigNumber(pricePerRwaToken);

  if (quantityTickSizeAtoms === undefined) {
    throw new Error("Order quantity tick size is required");
  }
  if (
    !alignQuantityAtomsToTick(amountAtoms, quantityTickSizeAtoms).eq(
      amountAtoms
    )
  ) {
    throw new Error(
      "Quantity is not aligned to the orderbook quantity tick size"
    );
  }

  if (!isMarketOrder && tickSizeAtoms !== undefined) {
    const tickSize = new BigNumber(tickSizeAtoms);

    if (
      tickSize.isFinite() &&
      tickSize.isInteger() &&
      tickSize.gt(0) &&
      !priceAtoms.mod(tickSize).isZero()
    ) {
      throw new Error("Price is not aligned to the orderbook tick size");
    }
  }

  if (minRwaTokenAmount !== undefined) {
    const minAmount = new BigNumber(minRwaTokenAmount);

    if (minAmount.isFinite() && minAmount.gt(0) && amountAtoms.lt(minAmount)) {
      throw new Error("Order amount is below the orderbook minimum");
    }
  }

  if (minQuoteValue !== undefined && baseTokenDecimals !== undefined) {
    const minValue = new BigNumber(minQuoteValue);
    const quoteValue = amountAtoms
      .times(priceAtoms)
      .div(decimalScale(baseTokenDecimals))
      .integerValue(BigNumber.ROUND_DOWN);

    if (minValue.isFinite() && minValue.gt(0) && quoteValue.lt(minValue)) {
      throw new Error("Order quote value is below the orderbook minimum");
    }
  }
};
