import { api } from "~/lib/utils/api";
import { DodoStorageType, dodoStorageTypeSchema } from "../dex.provider.types";
import { getPMMTokenPrice } from "~/lib/utils/dodoMav/price";
import { pickDodoContractBasedOnToken } from "~/consts/contracts";

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

export const getDodoMavTokenPrices = async (addresses: string[]) => {
  const promises = addresses.map((address) =>
    getContractStorageInfo(pickDodoContractBasedOnToken[address])
  );

  const storages = await Promise.all(promises);

  return storages.reduce<StringRecord<string>>((acc, storage) => {
    const slug = storage?.baseToken?.tokenContractAddress?.concat(
      `_${storage?.baseToken?.tokenId}`
    );
    if (slug && storage) {
      const price = getPMMTokenPrice(storage);
      acc[slug] = price.toString();
    }
    return acc;
  }, {});
};
