import type { SVGProps } from "react";

import type { TransferHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";

type RTransferTypeIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  type: TransferHistoryItemType["type"];
};

export function RTransferTypeIcon({ type, ...props }: RTransferTypeIconProps) {
  const isDeposit = type === "deposit";

  return (
    <svg fill="none" viewBox="0 0 16 16" {...props}>
      <path
        d={
          isDeposit
            ? "M8 3.33301V12.6663M4 8.66634L8 12.6663L12 8.66634"
            : "M8 12.6663V3.33301M12 7.33301L8 3.33301L4 7.33301"
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
