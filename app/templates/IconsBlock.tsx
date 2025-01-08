import { FC } from "react";
import BedIcon from "app/assets/propertyId/icons/bed.svg?react";
import ShowerIcon from "app/assets/propertyId/icons/shower.svg?react";
import SqftIcon from "app/assets/propertyId/icons/sqft.svg?react";
import HouseIcon from "app/assets/propertyId/icons/house.svg?react";
import BitcoinIcon from "app/assets/propertyId/icons/bitcoin.svg?react";
import BondIcon from "app/assets/propertyId/icons/bond.svg?react";
import KeysIcon from "app/assets/propertyId/icons/keys.svg?react";
import RateIcon from "app/assets/propertyId/icons/rate.svg?react";
import CoverageIcon from "app/assets/propertyId/icons/coverage.svg?react";
import PoliciesIcon from "app/assets/propertyId/icons/policies.svg?react";
import YieldIcon from "app/assets/propertyId/icons/yield.svg?react";
import VortexesIcon from "app/assets/propertyId/icons/window-with-vortexes.svg?react";
import LockIcon from "app/assets/propertyId/icons/lock.svg?react";
import clsx from "clsx";

const assetIconBasedOnKey: StringRecord<IconSVG> = {
  btcPrice: BitcoinIcon,
  amount: VortexesIcon,
  rooms: KeysIcon,
  sqft: SqftIcon,
  rate: RateIcon,
  homes: HouseIcon,
  baths: ShowerIcon,
  beds: BedIcon,
  bond: BondIcon,
  yield: YieldIcon,
  tvl: LockIcon,
  coverage: CoverageIcon,
  policies: PoliciesIcon,
};

export const IconsBlock: FC<{
  small?: boolean;
  basicInfo: StringRecord<string | number>;
}> = ({ basicInfo, small }) => {
  return (
    <section className="flex items-center gap-x-3">
      {Object.entries(basicInfo).map(([key, value]) => {
        return (
          <SingleIconBlock
            key={key}
            Icon={assetIconBasedOnKey[key]}
            label={value}
            small={small}
          />
        );
      })}
    </section>
  );
};

type SingleIconBlockProps = {
  Icon: IconSVG;
  label: string | number;
  small?: boolean;
};

const SingleIconBlock: FC<SingleIconBlockProps> = ({ Icon, label, small }) => {
  return (
    <div
      className={clsx(
        "shadow-card rounded-xl flex flex-col items-center justify-center gap-y-[2px]  overflow-hidden text-nowrap bg-white",
        "border border-gray-100",
        small ? "w-[64px] h-[64px]" : "w-[82px] h-[82px]"
      )}
    >
      {Boolean(Icon) && (
        <Icon className={clsx(small ? "w-7 h-7" : "w-8 h-8")} />
      )}
      <p className="text-dark-green-500 text-caption px-6">{label}</p>
    </div>
  );
};
