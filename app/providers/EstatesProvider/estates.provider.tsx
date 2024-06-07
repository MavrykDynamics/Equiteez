import {
  FC,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import estatesMocked from 'app/mocks/rwas.json';
import {
  EstatesContext,
  PrimaryEstate,
  SecondaryEstate,
} from './estates.types';

export const estatesContext = createContext<EstatesContext>(undefined!);

export const EstatesProvider: FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estatesState, setEstatesState] = useState<
    Pick<
      EstatesContext,
      | 'estates'
      | 'isLoading'
      | 'activeEstate'
      | 'isActiveEstateLoading'
      | 'isActiveEstateSecondaryMarket'
    >
  >(() => ({
    estates: estatesMocked,
    activeEstate: null,
    isActiveEstateLoading: true,
    isActiveEstateSecondaryMarket: false,
    isLoading: false,
  }));

  // TODO fetch here with graphql when the real api
  // for now it's mocked in json
  // useQuery (....) -> setEstates

  const pickEstateByAddress = useCallback(
    (address: string): PrimaryEstate | SecondaryEstate | null => {
      return (
        estatesState.estates.find((es) => es.token_address === address) ?? null
      );
    },
    [estatesState.estates]
  );

  const setActiveEstate = useCallback(
    (address: string) => {
      const estate = pickEstateByAddress(address);
      setEstatesState({
        ...estatesState,
        activeEstate: estate,
        isActiveEstateSecondaryMarket:
          estate?.assetDetails.type === 'Secondary Market',
        isActiveEstateLoading: false,
      });
    },
    [estatesState, pickEstateByAddress]
  );

  const memoizedEstatesProviderValue: EstatesContext = useMemo(
    () => ({ ...estatesState, pickEstateByAddress, setActiveEstate }),
    [estatesState, pickEstateByAddress, setActiveEstate]
  );

  return (
    <estatesContext.Provider value={memoizedEstatesProviderValue}>
      {children}
    </estatesContext.Provider>
  );
};

export const useEstatesContext = () => {
  const context = useContext(estatesContext);

  if (!context) {
    throw new Error('estatesContext should be used within EstatesProvider');
  }

  return context;
};
