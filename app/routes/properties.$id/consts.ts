// primary
export const PROPERTY_DETAILS_TAB = 'propertyDetails';
export const PROPERTY_FINANCIALS_TAB = 'financials';
export const PROPERTY_BLOCKCHAIN_TAB = 'blockchain';
export const PROPERTY_OFFERING_TAB = 'offering';

// secondary
export const PROPERTY_TRDADING_HISTORY_TAB = 'tradingHistory';
export const PROPERTY_OTC_TAB = 'otc';

export const PRIMARY_TABS = [
  PROPERTY_DETAILS_TAB,
  PROPERTY_FINANCIALS_TAB,
  PROPERTY_BLOCKCHAIN_TAB,
  PROPERTY_OFFERING_TAB,
];

export const SECONDARY_TABS = [PROPERTY_TRDADING_HISTORY_TAB, PROPERTY_OTC_TAB];

export const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];
