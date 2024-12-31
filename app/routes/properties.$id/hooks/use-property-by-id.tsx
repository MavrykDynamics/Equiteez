import { useMatches } from "@remix-run/react";

import { useEffect, useMemo } from "react";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { pickEstateByIdentifier } from "~/providers/EstatesProvider/utils";

export const usePropertyByAddress = (paramId = "id") => {
  const { estates, setActiveEstate } = useEstatesContext();
  const matches = useMatches();

  const id = matches[0].params[paramId];

  const estateData = useMemo(
    () => pickEstateByIdentifier(id, estates),
    [estates, id]
  );

  useEffect(() => {
    if (id) {
      setActiveEstate(id);
    }
  }, [id, setActiveEstate]);

  return estateData;
};
