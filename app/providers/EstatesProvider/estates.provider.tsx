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
    Pick<EstatesContext, 'estates' | 'isLoading'>
  >(() => ({
    estates: estatesMocked,
    isLoading: false,
  }));

  const [activeEstateData, setActiveEstateData] = useState<
    Pick<
      EstatesContext,
      'activeEstate' | 'isActiveEstateLoading' | 'isActiveEstateSecondaryMarket'
    >
  >(() => ({
    activeEstate: null,
    isActiveEstateLoading: true,
    isActiveEstateSecondaryMarket: false,
  }));

  // TODO fetch here with graphql when the real api
  // for now it's mocked in json
  // useQuery (....) -> setEstates

  const pickEstateByIdentifier = useCallback(
    (address: string): PrimaryEstate | SecondaryEstate | null => {
      return (
        estatesState.estates.find(
          (es) => es.assetDetails.blockchain[0].identifier === address
        ) ?? null
      );
    },
    [estatesState.estates]
  );

  const setActiveEstate = useCallback(
    (address: string) => {
      const estate = pickEstateByIdentifier(address);
      setActiveEstateData({
        activeEstate: estate,
        isActiveEstateSecondaryMarket:
          estate?.assetDetails.type === 'Secondary Market',
        isActiveEstateLoading: false,
      });
    },
    [pickEstateByIdentifier]
  );

  const memoizedEstatesProviderValue: EstatesContext = useMemo(
    () => ({
      ...estatesState,

      ...activeEstateData,
      pickEstateByIdentifier,
      setActiveEstate,
    }),
    [estatesState, pickEstateByIdentifier, setActiveEstate, activeEstateData]
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
