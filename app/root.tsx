import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { LinksFunction } from '@remix-run/node';

// providers
import ErrorBoundary from './templates/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// global styles
import stylesheet from '~/index.css?url';
import extendCSS from '~/extend.css?url';
import 'react-datepicker/dist/react-datepicker.css';

// providers
import { AppProvider } from './providers/AppProvider/AppProvider';
import { WalletProvider } from './providers/WalletProvider/wallet.provider';
import { UserProvider } from './providers/UserProvider/user.provider';
import { EstatesProvider } from './providers/EstatesProvider/estates.provider';
import { TokensProvider } from './providers/TokensProvider/tokens.provider';
import { PopupProvider } from './providers/PopupProvider/popup.provider';
import { AppGlobalLoader } from './providers/AppGlobalLoader';
import { CurrencyProvider } from './providers/CurrencyProvider/currency.provider';

export const links: LinksFunction = () => [
  { rel: 'preload', as: 'style', href: stylesheet },
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'preload', as: 'style', href: extendCSS },
  { rel: 'stylesheet', href: extendCSS },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

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
          <ErrorBoundary whileMessage="booting an app" className="min-h-screen">
            <QueryClientProvider client={queryClient}>
              <AppProvider>
                <WalletProvider>
                  <CurrencyProvider>
                    <TokensProvider>
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
            </QueryClientProvider>
          </ErrorBoundary>
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
