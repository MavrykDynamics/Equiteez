import React from "react";
import { AssetFlagsConst } from "~/routes/marketplace._index/components/consts/filters";
import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { Icon } from "~/lib/atoms/Icon";
import classNames from "clsx";

export function AssetFlag({ flagValue }: { flagValue: string }) {
  const flag = AssetFlagsConst.find((item) => item.value === flagValue) || null;

  if (!flag) return null;

  return (
    <div className={classNames(styles.flag, { [styles[flag.value]]: true })}>
      {flag.icon && <Icon icon={flag.icon} />}
      <Text size="smallBody" weight="semibold">
        {flag.name}
        {flag.image && ` ${flag.image}`}
      </Text>
    </div>
  );
}
