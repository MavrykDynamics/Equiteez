import { FC } from 'react';
import classNames from "clsx";
import styles from "./styles.module.css";

export const TableHeader: FC<PropsWithChildren & { mb?: number }> = ({
  mb = 6,
  children,
}) => {
  return (
    <h3 className={classNames(`mb-${mb} text-content text-card-headline`, styles.tableHeader)}>{children}</h3>
  );
};
