import { useMatches } from '@remix-run/react';

import { useEffect } from 'react';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

export const usePropertyByAddress = () => {
  const { activeEstate, setActiveEstate } = useEstatesContext();
  const matches = useMatches();

  const id = matches[0].params.id;

  useEffect(() => {
    if (id) {
      setActiveEstate(id);
    }
  }, [id, setActiveEstate]);

  return activeEstate;
};
