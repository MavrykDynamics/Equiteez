import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { json, LinksFunction } from '@remix-run/node';

// providers
import ErrorBoundary from './templates/ErrorBoundary';
import { EnvProvider } from './providers/EnvProvider/EnvProvider';

//h helpers
import { environment } from './providers/EnvProvider/environment.server';

// global styles
import stylesheet from '~/index.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

// loaders
export function loader() {
  return json({
    publicKeys: {
      NODE_ENV: environment().NODE_ENV,
      GOOGLE_MAPS_API_KEY: environment().GOOGLE_MAPS_API_KEY,
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { publicKeys } = useLoaderData<typeof loader>();

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
          <EnvProvider publicKeys={publicKeys}>{children}</EnvProvider>
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
