import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { api } from "~/lib/utils/api";
import { OrderbooksListSchema } from "~/providers/Dexprovider/schemas/orderbook.schema";

export const fetchOrderbooks = async () => {
  const url = `${mbrwaApiUrl}orderbooks`;

  const { data } = await api(url, { method: "GET" }, OrderbooksListSchema);

  return data;
};
