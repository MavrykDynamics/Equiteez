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
            <Text size="tinyBody" color="lightBlue">
              Account Value
            </Text>
            <Heading level="5">
              $<Money>{userBalance.account_value}</Money>
            </Heading>
          </div>
          <div className="flex flex-col lg:min-w-[204px]">
            <Text size="tinyBody" color="lightBlue">
              Available USDT
            </Text>
            <Heading level="5">
              $<Money>{userBalance.available_usdt}</Money>
            </Heading>
          </div>
          <div className="flex flex-col lg:min-w-[204px]">
            <Text size="tinyBody" color="lightBlue">
              PnL
            </Text>
            {userBalance.pnl >= 0 ? (
              <Heading level="5" color="green">
                +$5,000.00{" "}
                <Text color="green" weight="bold">
                  (+{userBalance.pnl}%)
                </Text>
              </Heading>
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
