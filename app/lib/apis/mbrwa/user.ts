import { api } from "~/lib/utils/api";
import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { UserBalanceSchema } from "./user/userBalance/balance.schema";

export const fetchUserBalanceDetails = async (userAddress: string) => {
  const { data } = await api(
    mbrwaApiUrl.concat(`wallet/${userAddress}/account`),
    undefined,
    UserBalanceSchema
  );

  return data;
};
