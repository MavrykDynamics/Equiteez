import { BigNumber } from "bignumber.js";
import { usePrimaryPurchaseConfig } from "../BuySellPanel/usePrimaryPurchase";
import { RPriceLabelGroup } from "./RPriceLabelGroup";

export function RPrimaryPriceLabelGroup({
  assetAddress,
}: {
  assetAddress: string;
}) {
  const { data } = usePrimaryPurchaseConfig(assetAddress);
  const option = data?.options[0];

  return (
    <RPriceLabelGroup
      variant="gallery"
      price={option ? new BigNumber(option.price).shiftedBy(-6) : undefined}
    />
  );
}
