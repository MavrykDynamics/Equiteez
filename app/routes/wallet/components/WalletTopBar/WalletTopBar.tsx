import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import { Text } from "~/lib/atoms/Typography/Text";
import { Heading } from "~/lib/atoms/Typography/Heading";
import Money from "~/lib/atoms/Money";
import { DepositWithdraw } from "~/routes/wallet/components/DepositWithdraw/DepositWithdraw";
import styles from "../../route.module.css";
import { useUserBalance } from "~/lib/apis/mbrwa/user/userBalance/useUserBalance";

export const WalletTopBar = () => {
  const { userBalance } = useUserBalance();

  return (
    <RoundedCard>
      <div className={styles.walletTopBarWrapper}>
        <div className="flex gap-y-[12px] gap-x-[50px] md:gap-x-[15px] w-full flex-1 justify-start flex-wrap md:justify-between lg:justify-start">
          <div className="flex flex-col lg:min-w-[205px]">
            <Text size="tinyBody" color="lightSand">
              Account Value
            </Text>
            <Text size="largeBody" weight="semibold">
              $<Money>{userBalance.account_value}</Money>
            </Text>
          </div>
          <div className="flex flex-col lg:min-w-[204px]">
            <Text size="tinyBody" color="lightSand">
              Available USDT
            </Text>
            <Text size="largeBody" weight="semibold">
              $<Money>{userBalance.available_usdt}</Money>
            </Text>
          </div>
          <div className="flex flex-col lg:min-w-[204px]">
            <Text size="tinyBody" color="lightSand">
              PnL
            </Text>
            {userBalance.pnl >= 0 ? (
              <Text size="largeBody" color="green" weight="semibold">
                +$5,000.00{" "}
                <Text color="green" weight="semibold">
                  (+{userBalance.pnl}%)
                </Text>
              </Text>
            ) : (
              <Heading level="5" color="red">
                -$5,000.00{" "}
                <Text color="red" weight="bold">
                  (-{userBalance.pnl}%)
                </Text>
              </Heading>
            )}
          </div>
        </div>
        <DepositWithdraw />
      </div>
    </RoundedCard>
  );
};
