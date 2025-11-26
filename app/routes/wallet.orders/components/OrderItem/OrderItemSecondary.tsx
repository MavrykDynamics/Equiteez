import React, { useState } from "react";
import styles from "../../styles.module.css";
import type { OrderType } from "~/lib/userOrders/orders.types";
import { useHandleOrder } from "~/routes/wallet.orders/components/OrderItem/useHandleOrder";
import { AssetIcon } from "~/templates/AssetIcon";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { formatDate } from "~/lib/utils/date";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import { Link } from "@remix-run/react";
import { MobileOrderPopup } from "~/routes/wallet.orders/components/MobileOrderPopup/MobileOrderPopup";

export function WalletOrderItemSecondaryContent({
  order,
  handleTogglePopup,
}: {
  order: OrderType;
  handleTogglePopup: () => void;
}) {
  return (
    <div className={styles.orderItemSecondary}>
      <div className="flex gap-[12px] items-center">
        <div className="flex items-end">
          <div className={styles.iconWrapper}>{order.orderIcon}</div>
          <AssetIcon
            key={order.tokenSlug}
            size={24}
            assetSlug={order.tokenSlug}
            className="w-[24px] h-[24px] rounded-[50%] overflow-hidden ml-[-12px]"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <Text size="smallBody" weight="bold">
              {order.orderName}&nbsp;
            </Text>
            <Link to={order.assetLink} className={styles.assetName}>
              <span className="hidden lg:inline">{order.token.name}</span>
              <span className="inline lg:hidden">
                {order.token.symbol.toUpperCase()}
              </span>
            </Link>
          </div>
          <Text size="tinyBody" color="lightBlue">
            {formatDate(order.created_at, true)}
          </Text>
        </div>
      </div>
      <div className="flex gap-[12px] items-center">
        <div className="flex flex-col items-end">
          <Text size="smallBody" weight="bold">
            <Money fiat>{order.rwa_token_amount}</Money> {order.token.symbol}
          </Text>
          <Text size="tinyBody" color="lightBlue">
            $<Money fiat>{order.price_per_rwa_token}</Money>/token
          </Text>
        </div>

        <button onClick={handleTogglePopup} className={styles.orderCancelBtn}>
          cancel
        </button>
      </div>
    </div>
  );
}

export function WalletOrderItemSecondary({
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

  const [isOpenDetailsPopup, setIsOpenDetailsPopup] = useState(false);

  return (
    <>
      <div className={styles.desktopBlock}>
        <WalletOrderItemSecondaryContent
          order={order}
          handleTogglePopup={handleTogglePopup}
        />
      </div>
      <div
        className={styles.mobileBlock}
        onClick={() => setIsOpenDetailsPopup(true)}
      >
        <WalletOrderItemSecondaryContent
          order={order}
          handleTogglePopup={handleTogglePopup}
        />
      </div>
      <CancelOrderPopup
        onClose={handleTogglePopup}
        isOpen={isOpenPopup}
        onSubmit={handleCancelOrder}
      />
      <MobileOrderPopup
        order={order}
        handleTogglePopup={handleTogglePopup}
        isOpen={isOpenDetailsPopup}
        onClose={() => setIsOpenDetailsPopup(false)}
      />
    </>
  );
}
