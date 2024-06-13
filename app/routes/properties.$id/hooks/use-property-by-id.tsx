import { useMatches } from '@remix-run/react';

import { useEffect } from 'react';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

export const usePropertyByAddress = (paramId = 'id') => {
  const { activeEstate, setActiveEstate } = useEstatesContext();
  const matches = useMatches();

  const id = matches[0].params[paramId];

  useEffect(() => {
    if (id) {
      setActiveEstate(id);
    }
  }, [id, setActiveEstate]);

  return activeEstate;
};
