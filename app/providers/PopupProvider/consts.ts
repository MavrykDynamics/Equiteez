import {
  popupOperationError,
  popupRwaBuyOperationSuccess,
  popupRwaSellOperationSuccess,
} from "~/contracts/templates/operationPopupData";
import { PopupState } from "./popup.provider.types";

export const POPUP_KEYS = {
  txRwaBuyOperation: "txRwaBuyOperation",
  txRwaSellOperation: "txRwaSellOperation",
};

export const DEFAULT_POPUPS_STATE: PopupState = {
  txRwaBuyOperation: {
    show: false,
    props: {
      icon: null,
      title: null,
      body: null,
    },
  },
  txRwaSellOperation: {
    show: false,
    props: {
      icon: null,
      title: null,
      body: null,
    },
  },
};

export const txTemplates = {
  txRwaBuyOperation: {
    success: popupRwaBuyOperationSuccess,
    error: popupOperationError,
  },
  txRwaSellOperation: {
    success: popupRwaSellOperationSuccess,
    error: popupOperationError,
  },
};
