import BigNumber from 'bignumber.js';
import { isDefined } from 'app/lib/utils';
import { FC } from 'react';
import { AssetField } from '~/lib/organisms/AssetField';
import clsx from 'clsx';
// import { AssetMetadataBase } from '~/lib/types/metadata';
import { toLocalFormat } from '~/lib/formaters/formaters';
import { AssetDropdown } from '../AssetDropdown';

type BalanceInputProps = {
  label?: string;
  onChange?: (value?: BigNumber) => void;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  selectedAssetSlug: string;
  children?: React.ReactNode;
  // selectedAssetMetadata: AssetMetadataBase;
};

export const BalanceInput: FC<BalanceInputProps> = ({
  label,
  onChange,
  amount,
  amountInputDisabled,
  children,
  selectedAssetSlug,
}) => {
  const handleAmountChange = (newAmount?: string) =>
    onChange?.(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );
  return (
    <section className="p-4 bg-gray-50 flex flex-col gap-2 rounded-2xl">
      {label && (
        <div className="text-left text-body-xs text-sand-600">{label}</div>
      )}
      <div>
        <AssetField
          value={amount?.toFixed(8).toString()}
          className={clsx(
            'text-asset-input text-left text-sand-600 border-none bg-opacity-0 pl-0 focus:shadow-none'
          )}
          style={{ padding: 0, borderRadius: 0 }}
          placeholder={toLocalFormat(0, { decimalPlaces: 2 })}
          min={0}
          max={9999999999999}
          disabled={amountInputDisabled}
          assetDecimals={6}
          // assetDecimals={selectedAssetMetadata.decimals}
          extraSection={
            <AssetDropdown selectedAssetSlug={selectedAssetSlug} disabled />
          }
          fieldWrapperBottomMargin={false}
          onChange={handleAmountChange}
        />
      </div>
      {children && <div>{children}</div>}
    </section>
  );
};
