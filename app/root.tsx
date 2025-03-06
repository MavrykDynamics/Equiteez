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
import { FC, useEffect } from "react";
import { DexProvider } from "./providers/Dexprovider/dex.provider";
import { MobileView } from "./providers/MobileView/MobileView";
import { DipdupProvider } from "./providers/DipdupProvider/DipDup.provider";

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
    gaTrackingId: process.env.GA_TRACKING_ID,
  });
};

const AppWrapper: FC<PropsWithChildren> = ({ children }) => {
  // TODO handle laoder data elsewhere
  const {
    gaTrackingId,
    tokens = [],
    tokensMetadata = {},
    fiatToTezos = {},
    usdToToken = {},
    isMobile = false,
  } = useDataFromLoader<typeof loader>() ?? {};

  useEffect(() => {
    addGtmScript(gaTrackingId);
  }, [gaTrackingId]);

  return (
    <AppProvider>
      <MobileView isMobile={isMobile}>
        <ApolloProvider>
          <DipdupProvider>
            <WalletProvider>
              <CurrencyProvider
                fiatToTezos={fiatToTezos}
                usdToToken={usdToToken}
              >
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
          </DipdupProvider>
        </ApolloProvider>
      </MobileView>
    </AppProvider>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const gaTrackingId = "GTM-TWZ386ZK";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gaTrackingId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager */}
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

/**
 * GTAG configuration to avoid hydration errors *********************
 */
let gtmScriptAdded = false;

declare global {
  interface Window {
    [key: string]: object[];
  }
}

function addGtmScript(GTM_ID: string | undefined) {
  if (!GTM_ID || gtmScriptAdded) {
    return;
  }

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];

    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w[l].push(arguments);
    }

    w.gtag = gtag;
    // @ts-expect-error // it uses arguments in general (see above gtag fn)
    gtag("js", new Date());

    if (!gtmScriptAdded) {
      // Ensure the script is not loaded multiple times
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s);
      const dl = l !== "dataLayer" ? "&l=" + l : "";
      // @ts-expect-error //it is script tag
      j.async = true;
      // @ts-expect-error //it is script tag
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode?.insertBefore(j, f);
    }
  })(window, document, "script", "dataLayer", GTM_ID);

  // @ts-expect-error // it uses arguments in general (see above gtag fn)
  gtag("config", GTM_ID, {
    page_path: window.location.pathname,
  });

  gtmScriptAdded = true;
}
