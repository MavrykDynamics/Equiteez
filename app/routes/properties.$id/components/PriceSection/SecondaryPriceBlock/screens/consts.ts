export const SELL = 'sell';
export const BUY = 'buy';
export const OTC = 'otc';
export const OTC_BUY = 'otcBuy';
export const OTC_SELL = 'otcSell';
export const CONFIRM = 'confirm';

// types
export type BuyScreenState = typeof BUY | typeof CONFIRM;
export type OTCScreenState = typeof OTC | typeof CONFIRM;
export type OTCTabType = typeof OTC_BUY | typeof OTC_SELL;
export type SellScreenState = typeof SELL | typeof CONFIRM;
