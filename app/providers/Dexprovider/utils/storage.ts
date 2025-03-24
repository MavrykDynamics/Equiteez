import { api } from "~/lib/utils/api";
import { DodoStorageType, dodoStorageTypeSchema } from "../dex.provider.types";
import { toTokenSlug } from "~/lib/assets";
import { getPMMTokenPrice } from "./price";
import BigNumber from "bignumber.js";
import { DexStorageQuery } from "~/utils/__generated__/graphql";
import { EstateType } from "~/providers/MarketsProvider/market.types";

export const getContractStorageInfo = async (address: string) => {
  try {
    const { data } = await api<DodoStorageType>(
      `${process.env.API_URL}/contracts/${address}/storage`
    );

    const parsedData = dodoStorageTypeSchema.parse(data);
    return parsedData;
  } catch (e) {
    console.log("Error while fetching storage data");
    throw e;
  }
};

export const getDodoMavTokenStorages = (
  queryData: DexStorageQuery
): StringRecord<DodoStorageType> => {
  const { dodo_mav } = queryData;

  return dodo_mav.reduce<StringRecord<DodoStorageType>>((acc, storage) => {
    const slug = toTokenSlug(
      storage?.base_token?.address,
      storage?.base_token?.token_id
    );

    if (!slug) return acc;

    const parsedData = {
      config: {
        lpFee: storage.lp_fee.toString(),
        feeDecimals: storage.fee_decimals.toString(),
        priceModel: storage.price_model,
        maintainerFee: storage.maintainer_fee,
        appraisalPrice: undefined,
        fixedPricePercent: storage.fixed_price_percent?.toString(),
        orderbookPricePercent: undefined,
      },
      rStatus: storage.r_status.toString(),
      baseToken: {
        tokenId: storage.base_token.token_id.toString(),
        tokenContractAddress: storage.base_token.address,
      },
      guidePrice: storage.guide_price.toString(),
      quoteToken: {
        tokenId: storage.quote_token.token_id.toString(),
        tokenContractAddress: storage.quote_token.address,
      },
      superAdmin: storage.address,
      baseBalance: storage.base_balance.toString(),
      baseLpToken: {
        tokenId: storage.base_lp_token.token_id.toString(),
        tokenContractAddress: storage.base_lp_token.address,
      },
      quoteBalance: storage.quote_balance.toString(),
      quoteLpToken: {
        tokenId: storage.quote_lp_token.token_id.toString(),
        tokenContractAddress: storage.quote_lp_token.address,
      },
      slippageFactor: storage.slippage_factor.toString(),
      baseBalanceLimit: storage.base_balance_limit.toString(),
      quoteBalanceLimit: storage.quote_balance_limit.toString(),
      targetBaseTokenAmount: storage.target_base_token_amount.toString(),
      targetQuoteTokenAmount: storage.target_quote_token_amount.toString(),
    };

    const result = dodoStorageTypeSchema.safeParse(parsedData);
    if (result.success) {
      acc[slug] = result.data;
    } else {
      console.error("Validation failed for", slug, result.error.format());
    }

    return acc;
  }, {});
};

export const getDodoMavTokenPrices = (
  storages: DodoStorageType[],
  markets: Map<string, EstateType>
) => {
  return storages.reduce<StringRecord<BigNumber>>((acc, storage) => {
    const slug = toTokenSlug(
      storage?.baseToken?.tokenContractAddress,
      storage?.baseToken?.tokenId
    );

    if (slug && storage) {
      const decimals = markets.get(slug)?.decimals;
      const price = getPMMTokenPrice(storage, decimals);
      acc[slug] = price;
    }
    return acc;
  }, {});
};

export const getDodoMavTokenPairs = (
  storagesRecord: StringRecord<DodoStorageType>
) => {
  return Object.entries(storagesRecord).reduce<StringRecord<string>>(
    (acc, [key, storage]) => {
      acc[key] = toTokenSlug(
        storage.quoteToken.tokenContractAddress,
        storage.quoteToken.tokenId
      );

      return acc;
    },
    {}
  );
};
