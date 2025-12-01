import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MBG_CONTRACT_ADDRESS,
  MBG_METADATA,
  MVRK_CONTRACT_ADDRESS,
} from "~/lib/metadata";
import { stablecoinContract } from "~/consts/contracts";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import { unknownToError } from "~/errors/error";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { toTokenSlug } from "~/lib/assets";
import {
  AssetsListType,
  AssetType,
} from "~/providers/UserAssets/userAssets.types";
import { fetchUserAssets } from "~/lib/apis/mbrwa/assets";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useQuery } from "@tanstack/react-query";

export const NOT_RWA_ASSETS = [
  MBG_CONTRACT_ADDRESS,
  stablecoinContract,
  MVRK_CONTRACT_ADDRESS,
];

// Fixed contracts
const FIXED_CONTRACTS = [
  {
    token: {
      address: MBG_CONTRACT_ADDRESS,
      name: MBG_METADATA.name,
      symbol: MBG_METADATA.symbol,
      apy: 0,
      icon: "",
    },
    total_balance: 0,
    available_balance: 0,
    available_balance_usd: 0,
    token_price: 0,
    price_change24h_percent: 0,
    in_orders: 0,
    in_orders_usd: 0,
    total_balance_usd: 0,
  },
];

interface AssetsContextType {
  userAssets: AssetType[];
  fixedAssets: AssetType[];
  loading: boolean;
  handleTransformAssets: (a: AssetsListType) => AssetType[];
}

const AssetsContext = createContext<AssetsContextType | null>(null);

export function UserAssetsProvider({ children }: { children: ReactNode }) {
  const { userAddress } = useUserContext();
  const { warning } = useToasterContext();

  const [userAssets, setUserAssets] = useState<AssetType[]>([]);

  const checkIsNotRwaAsset = useCallback(
    (tokenAddress: string) =>
      NOT_RWA_ASSETS.every((item) => item !== tokenAddress),
    []
  );

  const getTokenMarket = useCallback(
    (tokenAddress: string) => {
      if (checkIsNotRwaAsset(tokenAddress)) return AssetMarket.secondary;
      return AssetMarket.empty;
    },
    [checkIsNotRwaAsset]
  );

  const handleTransformAssets = useCallback(
    (list: AssetsListType): AssetType[] => {
      return list.assets.map((asset) => {
        const tokenSlug = toTokenSlug(asset.token.address);
        const market = getTokenMarket(asset.token.address);
        return { ...asset, tokenSlug, market };
      });
    },
    [getTokenMarket]
  );

  const fixedAssets = useMemo(
    () => handleTransformAssets({ assets: FIXED_CONTRACTS }),
    [handleTransformAssets]
  );

  const assetsData = useQuery({
    retry: false,
    queryKey: [userAddress, "fetchUserAssets"],
    queryFn: () => fetchUserAssets(userAddress || ""),
    enabled: !!userAddress,
  });

  // Error handling
  useEffect(() => {
    if (assetsData.error) {
      const err = unknownToError(assetsData.error);
      warning("Error fetching user asset data", err.message);
    }
  }, [assetsData.error]);

  // Save assets
  useEffect(() => {
    if (!assetsData.data) return;

    const transformed = handleTransformAssets(assetsData.data);

    setUserAssets(
      transformed.sort(
        (a, b) => b.available_balance_usd - a.available_balance_usd
      )
    );
  }, [assetsData.data, handleTransformAssets]);

  const loading =
    assetsData.isLoading || assetsData.isFetching || assetsData.isPending;

  return (
    <AssetsContext.Provider
      value={{
        userAssets,
        fixedAssets,
        loading,
        handleTransformAssets,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}

export function useUserAssetsContext() {
  const ctx = useContext(AssetsContext);
  if (!ctx) {
    throw new Error("useAssetsContext must be used inside <AssetsProvider>");
  }
  return ctx;
}
