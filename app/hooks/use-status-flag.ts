import { useCallback, useState } from 'react';

export type StatusFlag =
  | 'pending'
  | 'confirming'
  | 'error'
  | 'success'
  | 'idle';

export const useStatusFlag = () => {
  const [status, setStatus] = useState<StatusFlag>('idle');

  const handleStatusUpdate = useCallback((status: StatusFlag) => {
    setStatus(status);
  }, []);

  const setPending = useCallback(
    () => handleStatusUpdate('pending'),
    [handleStatusUpdate]
  );

  const setConfirming = useCallback(
    () => handleStatusUpdate('confirming'),
    [handleStatusUpdate]
  );

  const setError = useCallback(
    () => handleStatusUpdate('error'),
    [handleStatusUpdate]
  );

  const setSuccess = useCallback(
    () => handleStatusUpdate('success'),
    [handleStatusUpdate]
  );

  const setIdle = useCallback(
    () => handleStatusUpdate('idle'),
    [handleStatusUpdate]
  );

  return {
    setPending,
    setConfirming,
    setError,
    setSuccess,
    setIdle,
    status,
    isLoading: status === 'pending' || status === 'confirming',
  };
};
