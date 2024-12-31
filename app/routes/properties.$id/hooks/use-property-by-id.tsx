import { useMatches, useNavigate } from "@remix-run/react";

import { useEffect } from "react";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";

export const usePropertyByAddress = (paramId = "id") => {
  const { activeEstate, setActiveEstate, isActiveEstateLoading } =
    useEstatesContext();
  const matches = useMatches();
  const navigate = useNavigate();

  const id = matches[0].params[paramId];

  useEffect(() => {
    if (id) {
      setActiveEstate(id);
    }
  }, [id, setActiveEstate]);

  if (!isActiveEstateLoading && activeEstate === null) navigate("/properties");

  return activeEstate ?? null;
};
