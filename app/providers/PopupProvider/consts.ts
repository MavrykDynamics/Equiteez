import { PopupState } from './popup.provider.types';

export const POPUP_KEYS = {
  txOperation: 'txOperation',
};

export const DEFAULT_POPUPS_STATE: PopupState = {
  txOperation: {
    show: false,
    props: {
      Icon: null,
      title: null,
      body: null,
    },
  },
};
