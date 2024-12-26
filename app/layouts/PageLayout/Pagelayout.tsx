import { FC } from "react";

import clsx from "clsx";

import DocBg from "app/a11y/DocBg";

// layout components
import { Header } from "./Header";
import { Footer } from "./Footer/Footer";
import { Container } from "~/lib/atoms/Container";

type PageLayoutProps = {
  bg?: string;
  includeContainer?: boolean;
  includeFooter?: boolean;
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
  bg = "bg-background",
  includeContainer = true,
  includeFooter = true,
}) => {
  return (
    <div className={clsx("min-h-screen flex flex-col")}>
      <DocBg bgClassName={clsx(bg)} />

      <div className={clsx("relative flex flex-col flex-1")}>
        <Header />
        {includeContainer ? (
          <div className="flex-1">
            <Container>{children}</Container>
          </div>
        ) : (
          children
        )}
        {includeFooter && <Footer />}
      </div>
    </div>
  );
};

export default PageLayout;
