import { TransactionType } from "~/lib/apis/mbrwa/user/userTransactions/transactions.types";
import { useMemo, useState } from "react";
import { TransactionTypes } from "~/lib/apis/mbrwa/user/userTransactions/transactions.const";
import {
  TABLET_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";
import classNames from "clsx";
import styles from "~/routes/wallet.transactions/styles.module.css";
import { AssetIcon } from "~/templates/AssetIcon";
import { Text } from "~/lib/atoms/Typography/Text";
import { Link } from "@remix-run/react";
import { TransactionOrderStatusFlag } from "~/routes/wallet.transactions/components/TransactionItem/TransactionOrderStatusFlag";
import { formatDate } from "~/lib/utils/date";
import Money from "~/lib/atoms/Money";
import { Icon } from "~/lib/atoms/Icon";
import { MobileTransactionPopup } from "~/routes/wallet.transactions/components/MobileTransactionPopup/MobileTransactionPopup";
import { NOT_RWA_ASSETS } from "~/providers/UserAssets/userAssets.provider";
import { NEXUS_LINK } from "~/consts/links.const";

export function WalletTransactionItem({
  transaction,
  showId = false,
  addPadding = false,
}: {
  transaction: TransactionType;
  showId?: boolean;
  addPadding?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isTablet = width < TABLET_MAX_WIDTH;

  const [isOpenDetailsPopup, setIsOpenDetailsPopup] = useState(false);

  const { amount, amountUsd } = useMemo(() => {
    switch (transaction.type) {
      case TransactionTypes.ORDER:
        return {
          amount: transaction.rwa_token_amount,
          amountUsd: transaction.total_usd_value_of_rwa_token_amount,
        };
      case TransactionTypes.TRANSFER:
        return {
          amount: transaction.amount,
          amountUsd: transaction.usd_amount,
        };
      default:
        return {
          amount: 0,
          amountUsd: 0,
        };
    }
  }, [transaction]);

  const isNotRwa = NOT_RWA_ASSETS.some(
    (item) => item === transaction.token.address
  );

  return (
    <>
      <div
        className={classNames(
          styles.transactionItem,
          addPadding && styles.transactionItemPadding
        )}
        onClick={() => {
          if (isTablet) setIsOpenDetailsPopup(true);
        }}
      >
        <div className="flex gap-[12px] items-center">
          {showId && (
            <span className="text-xl font-semibold text-center text-white">
              ID {transaction.id}
            </span>
          )}
          <div className="flex items-end">
            <div className={styles.iconWrapper}>
              {transaction.transactionIcon}
            </div>
            <AssetIcon
              key={transaction.tokenSlug}
              size={24}
              assetSlug={transaction.tokenSlug}
              className="w-[24px] h-[24px] rounded-[50%] overflow-hidden ml-[-12px]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[4px]">
              <div className="flex item-center">
                <Text
                  size="smallBody"
                  weight="semibold"
                  className="flex item-center"
                >
                  {transaction.transactionName}&nbsp;
                </Text>
                {isNotRwa ? (
                  <Text size="smallBody" weight="semibold">
                    {transaction.tokenMetadata.symbol.toUpperCase()}
                  </Text>
                ) : (
                  <Link to={transaction.assetLink} className={styles.assetName}>
                    <span className="hidden lg:inline">
                      {transaction.tokenMetadata.name}
                    </span>
                    <span className="inline lg:hidden">
                      {transaction.tokenMetadata.symbol.toUpperCase()}
                    </span>
                  </Link>
                )}
              </div>
              {transaction.type === TransactionTypes.ORDER && (
                <div className="hidden lg:block">
                  <TransactionOrderStatusFlag
                    status={transaction.order_status}
                  />
                </div>
              )}
            </div>
            <Text size="tinyBody" color="lightSand">
              {formatDate(transaction.date, true)}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <div className="flex flex-col items-end">
            <Text size="smallBody" weight="semibold">
              {transaction.transactionSymbol}
              <Money fiat>{amount}</Money> {transaction.token.symbol}
            </Text>
            {amountUsd && (
              <Text color="lightSand" size="tinyBody">
                $<Money fiat>{amountUsd}</Money>
              </Text>
            )}
          </div>
          <a
            target="_blank"
            rel="noreferrer"
            href={`${NEXUS_LINK}/explorer/operation/${transaction.operation_hash}`}
            className="hidden lg:block"
          >
            <Text color="extraLightSand">
              <Icon icon="link" />
            </Text>
          </a>
        </div>
      </div>
      <MobileTransactionPopup
        transaction={transaction}
        onClose={() => setIsOpenDetailsPopup(false)}
        isOpen={isOpenDetailsPopup}
      />
    </>
  );
}
