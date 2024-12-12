import { api } from "~/lib/utils/api";
import { DodoStorageType, dodoStorageTypeSchema } from "../dex.provider.types";
import { pickDodoContractBasedOnToken } from "~/consts/contracts";
import { toTokenSlug } from "~/lib/assets";
import { getPMMTokenPrice } from "./price";
import BigNumber from "bignumber.js";

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

export const getDodoMavTokenStorages = async (addresses: string[]) => {
  const promises = addresses.map((address) =>
    getContractStorageInfo(pickDodoContractBasedOnToken[address])
  );

  const storages = await Promise.all(promises);

  return storages.reduce<StringRecord<DodoStorageType>>((acc, storage) => {
    const slug = toTokenSlug(
      storage?.baseToken?.tokenContractAddress,
      storage?.baseToken?.tokenId
    );

    if (slug) {
      acc[slug] = storage;
    }

    return acc;
  }, {});
};

export const getDodoMavTokenPrices = (storages: DodoStorageType[]) => {
  return storages.reduce<StringRecord<BigNumber>>((acc, storage) => {
    const slug = toTokenSlug(
      storage?.baseToken?.tokenContractAddress,
      storage?.baseToken?.tokenId
    );

    if (slug && storage) {
      const price = getPMMTokenPrice(storage);
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
