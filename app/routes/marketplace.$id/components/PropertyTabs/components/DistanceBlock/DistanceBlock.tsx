// Icons
import WalkIcon from "app/assets/propertyId/icons/walk.svg?react";
import TransportIcon from "app/assets/propertyId/icons/transport.svg?react";
import BicycleIcon from "app/assets/propertyId/icons/bicycle.svg?react";
import { FC } from "react";
import clsx from "clsx";

import styles from "../../propertyTabs.module.css";

// Walk score UI data --------------------

export type DistanceBlockProps = {
  type: keyof typeof distanceData;
  score: string | number;
};

const distanceData = {
  walk: {
    Icon: WalkIcon,
    label: "Walk",
    description: "Most errands require a car.",
  },
  transport: {
    Icon: TransportIcon,
    label: "Transport",
    description: "A few nearby public transportation options.",
  },
  bicycle: {
    Icon: BicycleIcon,
    label: "Bike",
    description: "Minimal bike infrastructure",
  },
};

export const DistanceBlock: FC<DistanceBlockProps> = ({ type, score }) => {
  const { Icon, label, description } = distanceData[type];

  return (
    <div className="flex items-center gap-x-4">
      <div
        className={clsx(
          "w-[52px] h-[52px] rounded-full overflow-hidden bg-dark-green-opacity",
          "flex items-center justify-center relative"
        )}
      >
        <Icon />
        <p className={styles.mapBlockNumber}>{score}</p>
      </div>
      <div className="flex flex-col gap-y-[2px] items-start">
        <p className="text-content text-buttons">{label}</p>
        <p className="text-body-xs text-content-secondary">{description}</p>
      </div>
    </div>
  );
};
