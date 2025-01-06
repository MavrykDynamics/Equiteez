import type { MetaFunction } from "@remix-run/node";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";

export const meta: MetaFunction = () => {
  return [
    { title: "Exchange" },
    { name: "description", content: "Exchange route!" },
  ];
};

export default function Exchange() {
  const { estatesArr, isLoading } = useEstatesContext();

  const id = useMemo(
    () =>
      estatesArr.length > 0
        ? estatesArr[0].assetDetails.blockchain[0].identifier
        : null,
    [estatesArr]
  );
  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <Navigate to={`/exchange/${id}`} state={{ fromExchange: true }} replace />
  );
}
