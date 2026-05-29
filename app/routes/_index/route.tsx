import type { MetaFunction } from "@remix-run/node";

import { RLandingPage } from "./components/RLandingPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez | Institutional Tokenized Asset Infrastructure" },
    {
      name: "description",
      content:
        "Equiteez delivers end-to-end real-world asset tokenization, trading, lending, and settlement infrastructure on the Mavryk Network.",
    },
  ];
};

export default function Index() {
  return <RLandingPage />;
}
