import { FC } from "react";

import clsx from "clsx";
import { Container } from "~/lib/atoms/Container/Container";
import { FiltersProvider } from "~/routes/marketplace._index/components/Filters/FiltersProvider";
import { RFooter } from "~/layouts/PageLayout/RFooter";
import { RHeader } from "~/layouts/PageLayout/RHeader/RHeader";
import { RMobileHeader } from "~/layouts/PageLayout/RHeader/RMobileHeader";
import { MobileLayout } from "~/layouts/PageLayout/MobileLayout";

import styles from "./Pagelayout.module.css";

type PageLayoutProps = {
  bg?: string;
  includeContainer?: boolean;
  includeFooter?: boolean;
  className?: string;
} & PropsWithChildren;

/**
 *
 * @param bg - background color in tailwind syntax to give general background for page
 * @param  includeContainer - boolean value, true when use Container width and false if not
 * be default it's true to have centered container, u may use false if u need some section be wider than usual
 * @returns
 */
const PageLayout: FC<PageLayoutProps> = ({
  children,
  includeContainer = true,
  includeFooter = true,
  className,
}) => {
  return (
    <FiltersProvider>
      <div className={styles.root}>
        {/*<MobileLayout />*/}

        <div
          className={clsx(
            "relative flex flex-col flex-1 pb-[66px] md:pb-0",
            styles.desktopLayout,
            className
          )}
        >
          <RHeader />
          {includeContainer ? (
            <div className="flex-1">
              <Container>{children}</Container>
            </div>
          ) : (
            children
          )}
          {includeFooter && <RFooter />}
          <RMobileHeader />
        </div>
      </div>
    </FiltersProvider>
  );
};

export default PageLayout;
