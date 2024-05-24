import { useMatches } from '@remix-run/react';

import estates from 'app/mocks/estates.json';
import { EstateType } from 'app/mocks/estates.type';

export const usePropertyById = (): EstateType | null => {
  const matches = useMatches();
  const id = "1";

  return estates.find((estate) => estate.id === id) ?? null;
};
