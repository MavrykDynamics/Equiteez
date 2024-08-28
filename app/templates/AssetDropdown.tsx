import { FC } from 'react';
import { AssetImage } from '~/lib/organisms/AssetImage';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { AssetIcon } from './AssetIcon';

const items = [1, 2, 3, 4];

type AssetDropdownProps = {
  selectedAssetSlug: string;
};

export const AssetDropdown: FC<AssetDropdownProps> = ({
  selectedAssetSlug,
}) => {
  const { tokensMetadata } = useTokensContext();
  const metadata = tokensMetadata[selectedAssetSlug];

  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <DropdownFaceContent>
          <div className="flex items-center">
            {metadata ? (
              <div className="flex items-center gap-2">
                <AssetIcon
                  key={selectedAssetSlug}
                  size={32}
                  assetSlug={selectedAssetSlug}
                />
                <span className="text-sand-900 text-body font-semibold">
                  {metadata.symbol}
                </span>
              </div>
            ) : (
              <div className="text-body text-sand-500">Select type</div>
            )}
          </div>
        </DropdownFaceContent>
      </ClickableDropdownArea>
      <DropdownBodyContent position="right" topMargin={16}>
        {items.map((item) => (
          <button
            key={item}
            className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
          >
            Change account {item}
          </button>
        ))}
      </DropdownBodyContent>
    </CustomDropdown>
  );
};
