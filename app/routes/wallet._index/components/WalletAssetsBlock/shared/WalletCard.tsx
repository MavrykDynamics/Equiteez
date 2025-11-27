import { FC, PropsWithChildren } from "react";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import styles from "../walletAssetsBlock.module.css";

import { Text } from "~/lib/atoms/Typography/Text";
import { Link } from "@remix-run/react";
import ArrowRight from "app/icons/arrow-right.svg?react";

type WalletCard = {
  header: string;
  link?: string;
  linkText?: string;
} & PropsWithChildren;

export const WalletCard: FC<WalletCard> = ({
  children,
  header,
  link,
  linkText,
}) => {
  return (
    <RoundedCard>
      <div className="flex flex-col gap-[24px]">
        <div className="flex items-center justify-between">
          <Text size="largeBody" weight="extraBold">
            {header}
          </Text>
          {link && linkText && (
            <Link to={link}>
              <button className={styles.link}>
                <Text
                  weight="extraBold"
                  color="yellow"
                  className="flex gap-[4px] items-center"
                >
                  <span className="underline">{linkText}</span>
                  <ArrowRight />
                </Text>
              </button>
            </Link>
          )}
        </div>
        {children}
      </div>
    </RoundedCard>
  );
};
