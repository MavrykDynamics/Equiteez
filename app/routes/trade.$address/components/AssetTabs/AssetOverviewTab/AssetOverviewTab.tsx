import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

export function AssetOverviewTab({ asset }: { asset: AssetType }) {
  return (
    <div>
      <RHeading size="h6" weight="medium">
        About {asset.metadata.name}
      </RHeading>
      <RText color="neutral-600" size="body-sm">
        {asset.profile.description}
      </RText>
    </div>
  );
}
