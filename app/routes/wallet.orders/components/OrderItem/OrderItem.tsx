import type { OrderType } from "~/lib/userOrders/orders.types";
import React from "react";
import styles from "~/routes/wallet.orders/styles.module.css";
import { AssetIcon } from "~/templates/AssetIcon";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import { useHandleOrder } from "~/routes/wallet.orders/components/OrderItem/useHandleOrder";

export function WalletOrderItem({
  order,
  handleAfterCancelOrder,
}: {
  order: OrderType;
  handleAfterCancelOrder: () => Promise<void>;
}) {
  const { handleCancelOrder, handleTogglePopup, isOpenPopup } = useHandleOrder(
    order,
    handleAfterCancelOrder
  );

  return (
    <div className={styles.orderItem}>
      <div className="flex gap-[8px] px-[8px] py-[12px] items-center">
        <AssetIcon
          key={order.tokenSlug}
          size={32}
          assetSlug={order.tokenSlug}
          className="w-[32px] h-[32px] rounded overflow-hidden"
        />
        <div className="flex flex-col">
          <Text
            size="smallBody"
            weight="semibold"
            className="truncate max-w-[180px]"
          >
            {order.token.name}
          </Text>
          <div className="flex item-center gap-[8px]">
            <Text size="tinyBody" color="lightSand">
              {order.token.symbol}
            </Text>
            <Text size="tinyBody" color="orange">
              APY 6.2%
            </Text>
          </div>
        </div>
      </div>
      <div className="flex items-center px-[8px]">
        <Text
          size="smallBody"
          color={order.isSell ? "red" : "green"}
          weight="semibold"
        >
          {order.orderName}
        </Text>
      </div>
      <div className="flex items-center px-[8px]">
        <Text size="smallBody" weight="semibold">
          $<Money fiat>{order.price_per_rwa_token}</Money>
        </Text>
      </div>
      <div className="flex items-center px-[8px]">
        <Text size="smallBody" weight="semibold">
          <Money fiat>{order.rwa_token_amount}</Money> {order.token.symbol}
        </Text>
      </div>
      <div className="flex items-center px-[8px]">
        <Text size="smallBody" weight="semibold">
          $<Money fiat>{order.total_usd_value_of_rwa_token_amount || 0}</Money>
        </Text>
      </div>
      <div className="flex items-center px-[16px]">
        <button onClick={handleTogglePopup} className={styles.orderCancelBtn}>
          cancel
        </button>
      </div>
      <CancelOrderPopup
        onClose={handleTogglePopup}
        isOpen={isOpenPopup}
        onSubmit={handleCancelOrder}
      />
    </div>
  );
}
