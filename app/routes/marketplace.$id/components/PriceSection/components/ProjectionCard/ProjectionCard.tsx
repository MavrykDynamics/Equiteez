import clsx from "clsx";
import { FC } from "react";
import Money from "~/lib/atoms/Money";

import styles from "./projectionCard.module.css";

type ProjectionGradient = "blue" | "orange";

type ProjectionCardProps = {
  apy: number;
  monthkyReturns: number;
  yearlyReturns: number;
  gradient: ProjectionGradient;
};

const outlineClasses: Record<ProjectionGradient, string> = {
  blue: styles.gradientBlue,
  orange: styles.gradientOrange,
};
export const ProjectionCard: FC<ProjectionCardProps> = ({
  apy,
  monthkyReturns,
  yearlyReturns,
  gradient,
}) => {
  return (
    <section
      className={clsx(
        "p-4 flex flex-col text-sand-900 border rounded-2xl",
        outlineClasses[gradient]
      )}
    >
      <p className="text-base font-semibold mb-3">Yield Projections</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <p>Estimated APY</p>
          <span className="font-semibold">{apy}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <p>Projected Monthly Returns</p>
          <div className="font-semibold">
            $<Money>{monthkyReturns}</Money>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <p>Projected Yearly Returns</p>
          <div className="font-semibold">
            $<Money>{yearlyReturns}</Money>
          </div>
        </div>
      </div>
    </section>
  );
};
