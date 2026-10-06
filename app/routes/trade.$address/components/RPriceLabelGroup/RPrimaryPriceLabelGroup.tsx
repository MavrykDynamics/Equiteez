import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { RPriceLabelGroup } from "./RPriceLabelGroup";

export function RPrimaryPriceLabelGroup({
  assetAddress,
}: {
  assetAddress: string;
}) {
  const { prices } = useAssetsContext();
  const price = prices[assetAddress]?.primary_issuance?.price;

  return (
    <RPriceLabelGroup
      variant="gallery"
      price={price !== undefined && Number.isFinite(price) ? price : undefined}
    />
  );
}
