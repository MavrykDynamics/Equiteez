import { PropsWithChildren, FC } from "react";

import styles from "./roundedCard.module.css";
import classNames from "clsx";

type RoundedCardProps = PropsWithChildren<{
  className?: string;
}>;

export const RoundedCard: FC<RoundedCardProps> = ({ children, className }) => {
  return (
    <section className={classNames(styles.roundedCard, className)}>
      {children}
    </section>
  );
};
