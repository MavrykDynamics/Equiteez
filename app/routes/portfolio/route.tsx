import { Container } from "~/lib/atoms/Container/Container";
import styles from "./styles.module.css";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { MobilePortfolio } from "~/routes/portfolio/components/MobilePortfolio/MobilePortfolio";

export default function Portfolio() {
  const rootData = useRouteLoaderData("root") as
    | { isMobile?: boolean }
    | undefined;
  const [isMobile, setIsMobile] = useState(rootData?.isMobile ?? false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1000px)");
    const handleViewportChange = () => setIsMobile(mediaQuery.matches);

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  if (isMobile)
    return (
      <Container>
        <MobilePortfolio />
      </Container>
    );

  return (
    <Container>
      <PortfolioProvider>
        <Outlet />
      </PortfolioProvider>
    </Container>
  );
}
