import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";
import type { OrderType } from "~/lib/apis/mbrwa/user/userOrders/orders.types";
import { Link } from "@remix-run/react";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { getAssetByAddress } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { formatDate } from "~/lib/utils/date";
import Money from "~/lib/atoms/Money";

export function MobileOrderPopup({
  order,
  handleTogglePopup,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  order: OrderType;
  onClose: () => void;
  handleTogglePopup: () => void;
}) {
  const { marketsArr } = useMarketsContext();

  const currentMarket = getAssetByAddress(marketsArr, order.token.address);

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition={"bottom"}
      className={classNames(
        "max-h-screen px-11 py-14 z-99 relative",
        styles.popupWrapper
      )}
    >
      <button className="absolute top-6 right-7 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-current stroke-current"
          onClick={onClose}
        />
      </button>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-[16px]">
          <img
            src={currentMarket?.assetDetails.assetImages[0]}
            className="w-full md:h-[244px] md:min-h-[244px] h-[180px] min-h-[180px] object-cover"
            alt={order.token.symbol}
          />
          <div className="flex flex-col gap-[12px] px-[16px] items-center">
            <Text color={order.isSell ? "red" : "green"} size="largeBody">
              {order.orderName}
            </Text>
            <div className="flex flex-col gap-[4px] items-center">
              <Text size="largeBody" weight="semibold">
                $
                <Money fiat>
                  {order.total_usd_value_of_rwa_token_amount || 0}
                </Money>
              </Text>
              <Text size="tinyBody" color="lightSand">
                {formatDate(order.created_at)}
              </Text>
            </div>
          </div>
          <div className={styles.line} />
          <div className="flex flex-col px-[16px] gap-[8px]">
            <Text size="tinyBody" color="lightSand">
              Name
            </Text>
            <Text size="largeBody" weight="semibold">
              {order.token.name}
            </Text>
          </div>
          <div className="flex items-center px-[16px] gap-[32px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightSand">
                Price/token
              </Text>
              <Text size="largeBody" weight="semibold">
                $<Money fiat>{order.price_per_rwa_token}</Money>
              </Text>
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightSand">
                Amount
              </Text>
              <Text size="largeBody" weight="semibold">
                <Money fiat>{order.rwa_token_amount}</Money>{" "}
                {order.token.symbol}
              </Text>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              handleTogglePopup();
            }}
            className={styles.orderCancelBtn}
          >
            Cancel Order
          </button>
        </div>

        <Link className="w-full px-[16px] py-[24px]" to={order.assetLink}>
          <Button className={styles.submitBtn}>View Asset</Button>
        </Link>
      </div>
    </CustomPopup>
  );
}
