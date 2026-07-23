import { FC } from "react";

import clsx from "clsx";

import DocBg from "app/a11y/DocBg";

// layout components
import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";
import { Container } from "~/lib/atoms/Container/Container";
import { Banner } from "./Banner/Banner";

import bannerContent from "app/mocks/banner.json";
import { FiltersProvider } from "~/routes/marketplace._index/components/Filters/FiltersProvider";
import { RFooter } from "~/layouts/RFooter";

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
      <div className={clsx("min-h-screen flex flex-col")}>

        <div
          className={clsx(
            "relative flex flex-col flex-1 pb-[66px] md:pb-0",
            className
          )}
        >
          <Header />
          {includeContainer ? (
            <div className="flex-1">
              <Container>{children}</Container>
            </div>
          ) : (
            children
          )}
          {includeFooter && <RFooter />}
        </div>
      </div>
    </FiltersProvider>
  );
};

export default PageLayout;
