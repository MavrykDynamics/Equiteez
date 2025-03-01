import { EstateType } from "../market.types";

export function pickEstateByIdentifier(
  address: string | undefined,
  estates: StringRecord<EstateType>
): EstateType | null {
  return (
    Object.values(estates).find(
      (es) => es.assetDetails.blockchain[0].identifier === address
    ) ?? null
  );
}
