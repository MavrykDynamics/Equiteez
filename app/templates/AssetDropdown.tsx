import { FC } from 'react';
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
  disabled?: boolean;
};

export const AssetDropdown: FC<AssetDropdownProps> = ({
  selectedAssetSlug,
  disabled,
}) => {
  const { tokensMetadata } = useTokensContext();
  const metadata = tokensMetadata[selectedAssetSlug];

  return (
    <div className="bg-white rounded-lg py-1 px-[6px]">
      <CustomDropdown disabled={disabled}>
        <ClickableDropdownArea>
          <DropdownFaceContent>
            <div className="flex items-center">
              {metadata ? (
                <div className="flex items-center gap-2">
                  <AssetIcon
                    key={selectedAssetSlug}
                    size={32}
                    assetSlug={selectedAssetSlug}
                    className="w-8 h-8"
                  />
                  <span className="text-sand-900 text-body font-semibold">
                    {metadata.symbol}
                  </span>
                </div>
              ) : (
                <span className="text-body text-sand-500 text-nowrap">
                  Select type
                </span>
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
    </div>
  );
};
