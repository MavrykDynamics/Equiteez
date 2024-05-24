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

// global styles
import stylesheet from '~/index.css?url';
import extendCSS from '~/extend.css?url';
import { AppProvider } from './providers/AppProvider/AppProvider';
import { WalletProvider } from './providers/WalletProvider/wallet.provider';
import { UserProvider } from './providers/UserProvider/user.provider';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: extendCSS },
];

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
            <AppProvider>
              <WalletProvider>
                <UserProvider>{children}</UserProvider>
              </WalletProvider>
            </AppProvider>
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
