import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';

// providers
import ErrorBoundary from './templates/ErrorBoundary';

// global styles
import stylesheet from '~/index.css?url';
import { EnvProvider } from './providers/EnvProvider/EnvProvider';
import { WalletProvider } from './providers/WalletProvider/wallet.provider';
import UserProvider from './providers/UserProvider/user.provider';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export async function loader({ context }: LoaderFunctionArgs) {
  return {
    env: {
      GOOGLE_MAPS_API_KEY: context.cloudflare.env.GOOGLE_MAPS_API_KEY,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { env } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorBoundary whileMessage="booting an app" className="min-h-screen">
          <EnvProvider env={env}>
            <WalletProvider>
              <UserProvider>{children}</UserProvider>
            </WalletProvider>
          </EnvProvider>
        </ErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
