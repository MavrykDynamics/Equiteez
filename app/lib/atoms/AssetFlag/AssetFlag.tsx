import React from "react";
import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { Icon } from "~/lib/atoms/Icon";
import classNames from "clsx";

const AssetFlagsConst = [
  {
    className: "new",
    value: "New",
    name: "New",
    icon: "",
    image: "✨",
    prevImage: "",
  },
  {
    className: "justLaunched",
    value: "Just Launched",
    name: "Just Launched",
    icon: "",
    image: "🎇",
    prevImage: "",
  },
  {
    className: "trending",
    value: "Trending",
    name: "Trending",
    icon: "",
    image: "🔥",
    prevImage: "",
  },
  {
    className: "highYield",
    value: "High Yield",
    name: "High Yield",
    icon: "",
    image: "💰",
    prevImage: "",
  },
  {
    className: "soldOut",
    value: "Sold Out",
    name: "Sold Out",
    icon: "",
    image: "😱",
    prevImage: "",
  },
  {
    className: "comingSoon",
    value: "Coming Soon",
    name: "Coming Soon",
    icon: "",
    image: "🤩",
    prevImage: "",
  },
];

export function AssetFlag({ flagValue }: { flagValue: string }) {
  const flag = AssetFlagsConst.find((item) => item.value === flagValue) || null;

  if (!flag) return null;

  return (
    <div className={classNames(styles.flag, { [styles[flag.className]]: true })}>
      {flag.icon && <Icon icon={flag.icon} />}
      <Text size="smallBody" weight="medium">
        {flag.name}
        {flag.image && ` ${flag.image}`}
      </Text>
    </div>
  );
}
