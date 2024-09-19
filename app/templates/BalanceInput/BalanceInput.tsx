import BigNumber from 'bignumber.js';
import { isDefined } from 'app/lib/utils';
import { FC } from 'react';
import { AssetField } from '~/lib/organisms/AssetField';
import clsx from 'clsx';
// import { AssetMetadataBase } from '~/lib/types/metadata';
import { toLocalFormat } from '~/lib/formaters/formaters';
import { AssetDropdown } from '../AssetDropdown';
import { AssetMetadataBase } from '~/lib/metadata';

type BalanceInputProps = {
  label?: string;
  onChange?: (value?: BigNumber) => void;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  selectedAssetSlug: string;
  children?: React.ReactNode;
  errorCaption?: string;
  selectedAssetMetadata: AssetMetadataBase;
};

export const BalanceInput: FC<BalanceInputProps> = ({
  label,
  onChange,
  amount,
  amountInputDisabled,
  children,
  selectedAssetSlug,
  errorCaption,
  selectedAssetMetadata,
}) => {
  const handleAmountChange = (newAmount?: string) =>
    onChange?.(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );
  return (
    <div className="flex flex-col gap-2">
      <section
        className={clsx(
          'p-4 bg-gray-50 flex flex-col gap-2 rounded-2xl border',
          errorCaption ? 'border-red-500' : 'border-transparent'
        )}
      >
        {label && (
          <div className="text-left text-body-xs text-sand-600">{label}</div>
        )}
        <div className="overflow-y-hidden">
          <AssetField
            value={amount
              ?.toFixed(selectedAssetMetadata?.decimals ?? 6)
              .toString()}
            className={clsx(
              'text-asset-input text-left text-sand-900 border-none bg-opacity-0 pl-0 focus:shadow-none overflow-y-hidden'
            )}
            containerClassName="overflow-y-hidden"
            style={{ padding: 0, borderRadius: 0, height: 42 }}
            placeholder={toLocalFormat(0, { decimalPlaces: 2 })}
            min={0}
            max={9999999999999}
            disabled={amountInputDisabled}
            assetDecimals={selectedAssetMetadata?.decimals ?? 6}
            extraSection={
              <AssetDropdown selectedAssetSlug={selectedAssetSlug} disabled />
            }
            onChange={handleAmountChange}
          />
        </div>
        {children && <div>{children}</div>}
      </section>
      {errorCaption && (
        <div className="text-red-500 text-body-xs">{errorCaption}</div>
      )}
    </div>
  );
};
