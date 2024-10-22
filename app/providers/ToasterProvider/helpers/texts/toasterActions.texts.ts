// doorman
import { STAKE_ACTION, UNSTAKE_ACTION } from '~/contracts/consts';

// types
import { ActionTypes } from '~/contracts/actions.type';
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
} from '../../toaster.provider.const';

type ToastMessageContent = {
  title: string;
  message: string;
};

type ToastMessageFullContent = {
  start: ToastMessageContent;
  end: ToastMessageContent;
};

export const TOASTER_ACTIONS_TEXTS: Record<
  ActionTypes,
  ToastMessageFullContent
> = {
  // doorman actions -------------------------------------
  [STAKE_ACTION]: {
    start: {
      title: 'Staking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Staking done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNSTAKE_ACTION]: {
    start: {
      title: 'Unstaking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Unstaking done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
};
