import { FC } from "react";

export const TableDescription: FC<PropsWithChildren> = ({ children }) => {
  return (
    <p className="text-content text-body mb-6 whitespace-pre-wrap">
      {children}
    </p>
  );
};
