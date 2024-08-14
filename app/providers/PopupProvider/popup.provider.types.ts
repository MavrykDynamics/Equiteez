import { CustomPopupProps } from '~/lib/organisms/CustomPopup/CustomPopup';
import { POPUP_KEYS } from './consts';

export type PopupProviderContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showPopup: (key: string, props: any) => void;
  hidePopup: (key: string) => void;
  popupKeys: typeof POPUP_KEYS;
};

export const DEFAULT_POPUPS_STATE = {
  txOperation: {
    show: false,
    props: null,
  },
};

type PopupKeys = keyof typeof POPUP_KEYS;

export type PopupState = {
  [key in PopupKeys]: {
    show: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any;
  };
};

export type DefaultPopupProps = Pick<
  CustomPopupProps,
  'isOpen' | 'onRequestClose'
>;
