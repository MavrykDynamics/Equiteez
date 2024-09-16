import { useReducer } from 'react';

export const STATUS_PENDING = 'STATUS_PENDING';
export const STATUS_CONFIRMING = 'STATUS_CONFIRMING';
export const STATUS_ERROR = 'STATUS_ERROR';
export const STATUS_SUCCESS = 'STATUS_SUCCESS';
export const STATUS_IDLE = 'STATUS_IDLE';

export type StatusFlag =
  | typeof STATUS_PENDING
  | typeof STATUS_SUCCESS
  | typeof STATUS_CONFIRMING
  | typeof STATUS_IDLE
  | typeof STATUS_ERROR;

type ReducerStateType = {
  status: StatusFlag;
  isLoading: boolean;
};

export type StatusDispatchType = React.Dispatch<StatusFlag>;

function statusFlagsReducer(state: ReducerStateType, status: StatusFlag) {
  switch (status) {
    case STATUS_IDLE:
    case STATUS_ERROR:
    case STATUS_SUCCESS: {
      return { ...state, status, isLoading: false };
    }
    case STATUS_CONFIRMING:
    case STATUS_PENDING: {
      return { ...state, status, isLoading: true };
    }
    default: {
      throw new Error(`Unhandled action status: ${status}`);
    }
  }
}

export const useStatusFlag = (initialStatus: StatusFlag = STATUS_IDLE) => {
  const [state, dispatch] = useReducer(statusFlagsReducer, {
    status: initialStatus,
    isLoading: false,
  });

  return {
    dispatch,
    status: state.status,
    isLoading: state.isLoading,
  };
};

// utils

export const getStatusLabel = (status: StatusFlag, defaultLabel: string) => {
  switch (status) {
    case STATUS_PENDING:
      return 'Pending...';
    case STATUS_CONFIRMING:
      return 'Confirming...';
    case STATUS_ERROR:
      return 'Error.';
    case STATUS_IDLE:
      return defaultLabel;
    case STATUS_SUCCESS:
      return 'Success!';

    default:
      return defaultLabel;
  }
};
