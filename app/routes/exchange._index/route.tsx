import type { MetaFunction } from "@remix-run/node";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";

export const meta: MetaFunction = () => {
  return [
    { title: "Exchange" },
    { name: "description", content: "Exchange route!" },
  ];
};

export default function Exchange() {
  const { marketsArr, isLoading } = useMarketsContext();

  const id = useMemo(
    () =>
      marketsArr.length > 0
        ? marketsArr[0].assetDetails.blockchain[0].identifier
        : null,
    [marketsArr]
  );
  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <Navigate to={`/exchange/${id}`} state={{ fromExchange: true }} replace />
  );
}
