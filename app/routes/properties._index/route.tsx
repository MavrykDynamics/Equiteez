import type { MetaFunction } from "@remix-run/node";
import { Navigate } from "@remix-run/react";
export const meta: MetaFunction = () => {
  return [
    { title: "MarketPlace" },
    { name: "description", content: "Assets Marketplace Redirect" },
  ];
};

export default function Index() {
  return <Navigate to="/marketplace" />;
}
