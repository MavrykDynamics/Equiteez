import { RefObject, MutableRefObject, useEffect } from 'react';

export const USER_ACTION_TIMEOUT = 30_000;

export const useBlurElementOnTimeout = <E extends HTMLOrSVGElement>(
  ref: RefObject<E | nullish> | MutableRefObject<E | nullish>,
  condition: boolean,
  timeout = USER_ACTION_TIMEOUT,
  callback?: () => void
) => {
  useEffect(() => {
    if (!condition) return;

    const handleLocalBlur = () => {
      ref.current?.blur();
      callback?.();
    };

    const timeoutId = setTimeout(handleLocalBlur, timeout);

    window.addEventListener('blur', handleLocalBlur);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('blur', handleLocalBlur);
    };
  }, [ref, condition, timeout, callback]);
};
