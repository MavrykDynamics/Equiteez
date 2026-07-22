import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useMemo } from "react";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";

export function AssetsFilters() {
  const { assets } = useAssetsContext();

  return (
    <div className={styles.wrapper}>
      <RTabSwitcher
        ariaLabel="tesdt"
        tabs={[
          { id: "1", label: "label 1" },
          { id: "2", label: "label 2" },
        ]}
        activeTabId={"1"}
        onChange={(b: string) => {}}
      />
    </div>
  );
}
