import { useMatches } from '@remix-run/react';

import estates from 'app/mocks/estates.json';
import { EstateType } from 'app/mocks/estates.type';

export const usePropertyById = (): {
  estate: EstateType | null;
  id: string | undefined;
} => {
  const matches = useMatches();

  const id = matches[0].params.id;

  return { estate: estates.find((estate) => estate.id === id) ?? null, id };
};
