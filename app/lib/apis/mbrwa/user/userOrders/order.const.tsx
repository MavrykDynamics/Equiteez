import BuyIcon from "~/icons/wallet/orderBuy.svg?react";
import SellIcon from "~/icons/wallet/orderSell.svg?react";
import MarketBuyIcon from "~/icons/wallet/buy.svg?react";
import MarketSellIcon from "~/icons/wallet/sell.svg?react";

export enum OrderTypes {
  LIMIT_BUY = 0,
  LIMIT_SELL = 1,
  MARKET_BUY = 2,
  MARKET_SELL = 3,
}

export enum OrderStatus {
  ACTIVE = 0,
  CANCELED = 1,
  EXPIRED = 2,
  FULFILLED = 3,
  REFUNDED = 4,
}

export const OrderStatusNames = {
  [OrderStatus.ACTIVE]: "Active",
  [OrderStatus.CANCELED]: "Canceled",
  [OrderStatus.EXPIRED]: "Expired",
  [OrderStatus.FULFILLED]: "Fulfilled",
  [OrderStatus.REFUNDED]: "Refunded",
};

export const OrderNameByType = {
  [OrderTypes.LIMIT_BUY]: "Limit Buy",
  [OrderTypes.LIMIT_SELL]: "Limit Sell",
  [OrderTypes.MARKET_BUY]: "Buy",
  [OrderTypes.MARKET_SELL]: "Sell",
};

export const OrderSymbolByType = {
  [OrderTypes.LIMIT_BUY]: "+",
  [OrderTypes.LIMIT_SELL]: "-",
  [OrderTypes.MARKET_BUY]: "+",
  [OrderTypes.MARKET_SELL]: "-",
};

export const OrderIconByType = {
  [OrderTypes.LIMIT_BUY]: <BuyIcon />,
  [OrderTypes.LIMIT_SELL]: <SellIcon />,
  [OrderTypes.MARKET_BUY]: <MarketBuyIcon />,
  [OrderTypes.MARKET_SELL]: <MarketSellIcon />,
};
