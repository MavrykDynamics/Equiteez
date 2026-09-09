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

export type OrderType = typeof BUY | typeof SELL | typeof OTC | typeof CONFIRM;

// TODO hardcoded price for now
export const TOKEN_PRICE = '45.00';

// TODO take values from user context and his wallet balance
export const BALANCE_LIMIT = 749;
export const TOKEN_BALANCE_LIMIT = 999;
