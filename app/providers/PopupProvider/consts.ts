import { popupOperationInProgress } from "~/contracts/templates/operationPopupData";
import { PopupState } from "./popup.provider.types";

export const POPUP_KEYS = {
  inProgressRwaAd: "inProgressRwaAd",
};

export const DEFAULT_POPUPS_STATE: PopupState = {
  inProgressRwaAd: {
    show: false,
    props: {
      title: null,
      body: null,
    },
  },
};

export const txTemplates = {
  inProgressRwaAd: popupOperationInProgress,
};
