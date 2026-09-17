import { FC } from "react";
import styles from "./styles.module.css";
import classNames from "clsx";

export const TableDescription: FC<PropsWithChildren> = ({ children }) => {
  return (
    <p
      className={classNames(
        "text-content text-body mb-6 whitespace-pre-wrap",
        styles.tableDescription
      )}
    >
      {children}
    </p>
  );
};
