import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
// providers

// global styles
import stylesheet from "~/styles/index.css?url";
import marqueeStylesheet from "~/styles/marquee.css?url";
import "react-datepicker/dist/react-datepicker.css";

// providers
import { AppProvider } from "./providers/AppProvider/AppProvider";
import { WalletProvider } from "./providers/WalletProvider/wallet.provider";
import { UserProvider } from "./providers/UserProvider/user.provider";
import { EstatesProvider } from "./providers/EstatesProvider/estates.provider";
import { TokensProvider } from "./providers/TokensProvider/tokens.provider";
import { PopupProvider } from "./providers/PopupProvider/popup.provider";
import { AppGlobalLoader } from "./providers/AppGlobalLoader";
import { CurrencyProvider } from "./providers/CurrencyProvider/currency.provider";
import {
  fetchTokensData,
  fetchTokensMetadata,
} from "./providers/TokensProvider/utils/fetchTokensdata";
import { fetchUsdToTokenRates } from "./lib/mavryk/endpoints/get-exchange-rates";
import { useDataFromLoader } from "./hooks/useDataFromLoader";
import ToasterProvider from "./providers/ToasterProvider/toaster.provider";
import { ApolloProvider } from "./providers/ApolloProvider/apollo.provider";
import { ToasterMessages } from "./providers/ToasterProvider/components/ToasterMessages";
import { ErrorPageTemp } from "./templates/ErrorPageTemp/ErrorPageTemp";
import {
  errorDescDefaultText,
  errorDescDefaultTextWhenError,
  errorHeaderDefaultText,
  errorHeaderDefaultTextWhenError,
} from "./providers/ToasterProvider/toaster.provider.const";
import { FC } from "react";
import { DexProvider } from "./providers/Dexprovider/dex.provider";
import { MobileView } from "./providers/MobileView/MobileView";

export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: stylesheet },
  { rel: "stylesheet", href: stylesheet },
  { rel: "preload", as: "style", href: marqueeStylesheet },
  { rel: "stylesheet", href: marqueeStylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userAgent = request.headers.get("user-agent") || "";

  // Simple regex to detect mobile devices
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);

  const tokens = await fetchTokensData();

  const [tokensMetadata, usdToToken] = await Promise.all([
    fetchTokensMetadata(tokens),
    fetchUsdToTokenRates(),
  ]);

  return json({
    tokens,
    tokensMetadata,
    usdToToken,
    isMobile,
    fiatToTezos: {},
  });
};

const AppWrapper: FC<PropsWithChildren> = ({ children }) => {
  // TODO handle laoder data elsewhere
  const {
    tokens = [],
    tokensMetadata = {},
    fiatToTezos = {},
    usdToToken = {},
    isMobile = false,
  } = useDataFromLoader<typeof loader>() ?? {};

  return (
    <AppProvider>
      <MobileView isMobile={isMobile}>
        <ApolloProvider>
          <WalletProvider>
            <CurrencyProvider fiatToTezos={fiatToTezos} usdToToken={usdToToken}>
              <TokensProvider
                initialTokens={tokens}
                initialTokensMetadata={tokensMetadata}
              >
                <EstatesProvider>
                  <DexProvider>
                    <UserProvider>
                      <AppGlobalLoader>
                        <PopupProvider>{children}</PopupProvider>
                      </AppGlobalLoader>
                    </UserProvider>
                  </DexProvider>
                </EstatesProvider>
              </TokensProvider>
            </CurrencyProvider>
          </WalletProvider>
        </ApolloProvider>
      </MobileView>
    </AppProvider>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <div id="root">
          <ToasterProvider
            maintance={process.env.REACT_APP_MAINTANCE_MODE === "on"}
          >
            <AppWrapper>{children}</AppWrapper>
            <ToasterMessages />
          </ToasterProvider>
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorPageTemp
        headerText={errorHeaderDefaultText}
        descText={errorDescDefaultText}
        type="router"
      />
    );
  }

  return (
    <ErrorPageTemp
      headerText={errorHeaderDefaultTextWhenError}
      descText={errorDescDefaultTextWhenError}
      type="fatal"
    />
  );
}
