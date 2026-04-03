import { OrderBookData } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";

const DESKTOP_DEPTH_WIDTH = 311;

const toDepthPercentage = (width: number) =>
  Number(((width / DESKTOP_DEPTH_WIDTH) * 100).toFixed(2));

export const SECONDARY_ORDER_BOOK_DATA: OrderBookData = {
  title: "Order Book",
  toggleLabels: {
    hide: "Hide Order Book",
    show: "Show Order Book",
  },
  headers: {
    amount: "Amount (KR)",
    price: "Price (USDT)",
    total: "Total (USDT)",
  },
  asks: [
    {
      amount: 30,
      depthPercentage: toDepthPercentage(5.271),
      price: 52,
      total: 1560,
    },
    {
      amount: 30,
      depthPercentage: toDepthPercentage(8.434),
      price: 52,
      total: 1560,
    },
    {
      amount: 30,
      depthPercentage: toDepthPercentage(13.705),
      price: 52,
      total: 1560,
    },
    {
      amount: 30,
      depthPercentage: toDepthPercentage(95.936),
      price: 52,
      total: 1560,
    },
    {
      amount: 30,
      depthPercentage: toDepthPercentage(23.193),
      price: 52,
      total: 1560,
    },
    {
      amount: 30,
      depthPercentage: toDepthPercentage(311),
      price: 50,
      total: 1500,
    },
    {
      amount: 28,
      depthPercentage: toDepthPercentage(311),
      price: 49,
      total: 1591,
    },
    {
      amount: 28,
      depthPercentage: toDepthPercentage(311),
      price: 49,
      total: 1591,
    },
  ],
  spread: {
    price: 49,
    referencePrice: 49,
  },
  bids: [
    {
      amount: 33,
      depthPercentage: toDepthPercentage(311.217),
      price: 48,
      total: 2019,
    },
    {
      amount: 29,
      depthPercentage: toDepthPercentage(311.217),
      price: 47,
      total: 1307,
    },
    {
      amount: 31,
      depthPercentage: toDepthPercentage(311.217),
      price: 46,
      total: 1307,
    },
    {
      amount: 35,
      depthPercentage: toDepthPercentage(23.209),
      price: 45,
      total: 1900,
    },
    {
      amount: 32,
      depthPercentage: toDepthPercentage(54.859),
      price: 44,
      total: 1450,
    },
    {
      amount: 34,
      depthPercentage: toDepthPercentage(13.715),
      price: 43,
      total: 2200,
    },
    {
      amount: 31,
      depthPercentage: toDepthPercentage(29.539),
      price: 46,
      total: 2671,
    },
    {
      amount: 31,
      depthPercentage: toDepthPercentage(100.222),
      price: 46,
      total: 2671,
    },
  ],
  sentiment: {
    buy: 54,
    sell: 46,
  },
};
