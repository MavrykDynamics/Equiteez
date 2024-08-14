import { PopupState } from './popup.provider.types';

export const POPUP_KEYS = {
  txOperation: 'txOperation',
};

export const DEFAULT_POPUPS_STATE: PopupState = {
  txOperation: {
    show: false,
    props: {
      icon: null,
      title: null,
      body: null,
    },
  },
};
