import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";
import { Link } from "@remix-run/react";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { getAssetByAddress } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { formatDate } from "~/lib/utils/date";
import { TransactionOrderStatusFlag } from "~/routes/wallet.transactions/components/TransactionItem/TransactionOrderStatusFlag";
import { TransactionTypes } from "~/lib/apis/mbrwa/user/userTransactions/transactions.const";
import { Icon } from "~/lib/atoms/Icon";
import { TransactionType } from "~/lib/apis/mbrwa/user/userTransactions/transactions.types";

export function MobileTransactionPopup({
  transaction,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  transaction: TransactionType;
  onClose: () => void;
}) {
  const { marketsArr } = useMarketsContext();

  const currentMarket = getAssetByAddress(
    marketsArr,
    transaction.token.address
  );

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
            alt={transaction.token.symbol}
          />
          <div className="flex flex-col gap-[12px] px-[16px] items-center">
            <Text size="largeBody">
              {transaction.transactionName}&nbsp;
              {transaction.token.symbol.toUpperCase()}
            </Text>
            <div className="flex flex-col gap-[4px] items-center">
              <Text
                color={transaction.isSell ? "red" : "green"}
                size="largeBody"
                weight="extraBold"
              >
                {transaction.transactionSymbol}$
                {transaction.type === TransactionTypes.ORDER
                  ? transaction.total_usd_value_of_rwa_token_amount
                  : transaction.usd_amount}
              </Text>
              <Text size="tinyBody" color="lightSand">
                {formatDate(transaction.date, true)}
              </Text>
            </div>
          </div>
          <div className={styles.line} />
          <div className="flex flex-col px-[16px] gap-[8px]">
            <Text size="tinyBody" color="lightSand">
              Name
            </Text>
            <Text size="largeBody" weight="semibold">
              {transaction.tokenMetadata.name}
            </Text>
          </div>
          <div className="flex items-center px-[16px] gap-[32px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightSand">
                Action
              </Text>
              <Text size="largeBody" weight="semibold">
                {transaction.transactionName}
              </Text>
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightSand">
                Status
              </Text>
              {transaction.type === TransactionTypes.ORDER && (
                <div className="w-fit">
                  <TransactionOrderStatusFlag
                    status={transaction.order_status}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-[8px] mt-[16px]">
            <Text color="darkGreen">
              <Icon className="w-[16px]" icon="link" />
            </Text>
            <button onClick={() => {}} className={styles.orderCancelBtn}>
              View on the Explorer
            </button>
          </div>
        </div>

        <Link className="w-full px-[16px] py-[24px]" to={transaction.assetLink}>
          <Button className={styles.submitBtn}>View Asset</Button>
        </Link>
      </div>
    </CustomPopup>
  );
}
