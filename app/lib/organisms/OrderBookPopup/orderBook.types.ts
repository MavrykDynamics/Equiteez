export type OrderBookRow = {
  amount: number;
  depthPercentage: number;
  price: number;
  total: number;
};

export type OrderBookData = {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
  headers: {
    amount: string;
    price: string;
    total: string;
  };
  sentiment: {
    buy: number;
    sell: number;
  };
  spread: {
    bestAsk: number;
    bestBid: number;
    price: number;
    value: number;
  };
  title: string;
  toggleLabels: {
    hide: string;
    show: string;
  };
};

export type OrderBookToggleLabels = OrderBookData["toggleLabels"];

export type OrderBookDisplayMode = "both" | "buy" | "sell";
