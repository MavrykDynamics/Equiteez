import { atomsToTokens } from "~/lib/utils/formaters";
import { OrderbookPrices } from "~/providers/Dexprovider/schemas/orderbook.schema";

export const getRwaTokenPriceBasedOnOrders = (
  data: OrderbookPrices,
  decimals: number = 6
) => {
  const { buy_price_per_token, sell_price_per_token } = data;

  const buyPrice = buy_price_per_token || 0;
  const sellPrice = sell_price_per_token || 0;

  return {
    buyPrice: atomsToTokens(buyPrice, decimals),
    sellPrice: atomsToTokens(sellPrice, decimals),
  };
};
