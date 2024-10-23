import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { json, LinksFunction } from "@remix-run/node";

// providers
import CustomErrorBoundary from "./templates/ErrorBoundary";

// global styles
import stylesheet from "~/index.css?url";
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
import { fetchFiatToTezosRates } from "./lib/fiat-currency";
import { fetchUsdToTokenRates } from "./lib/mavryk/endpoints/get-exchange-rates";
import { useDataFromLoader } from "./hooks/useDataFromLoader";
import ToasterProvider from "./providers/ToasterProvider/toaster.provider";
import { ApolloProvider } from "./providers/ApolloProvider/apollo.provider";
import { ToasterMessages } from "./providers/ToasterProvider/components/ToasterMessages";

export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: stylesheet },
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async () => {
  const tokens = await fetchTokensData();

  const [tokensMetadata, fiatToTezos, usdToToken] = await Promise.all([
    fetchTokensMetadata(tokens),
    fetchFiatToTezosRates(),
    fetchUsdToTokenRates(),
  ]);

  return json({ tokens, tokensMetadata, fiatToTezos, usdToToken });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { tokens, tokensMetadata, fiatToTezos, usdToToken } =
    useDataFromLoader<typeof loader>();

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
          <CustomErrorBoundary
            whileMessage="booting an app"
            className="min-h-screen"
          >
            <ToasterProvider
              maintance={process.env.REACT_APP_MAINTANCE_MODE === "on"}
            >
              {/* <ApolloProvider> */}
              <AppProvider>
                <WalletProvider>
                  <CurrencyProvider
                    fiatToTezos={fiatToTezos}
                    usdToToken={usdToToken}
                  >
                    <TokensProvider
                      initialTokens={tokens}
                      initialTokensMetadata={tokensMetadata}
                    >
                      <UserProvider>
                        <EstatesProvider>
                          <AppGlobalLoader>
                            <PopupProvider>{children}</PopupProvider>
                          </AppGlobalLoader>
                        </EstatesProvider>
                      </UserProvider>
                    </TokensProvider>
                  </CurrencyProvider>
                </WalletProvider>
              </AppProvider>
              {/* </ApolloProvider> */}
              <ToasterMessages />
            </ToasterProvider>
          </CustomErrorBoundary>
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
