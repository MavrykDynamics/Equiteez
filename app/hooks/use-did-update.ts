import { useEffect, useRef } from 'react';

import { useDidMount } from './use-did-mount';
import { useUpdatableRef } from './use-updatable-ref';
import { useWillUnmount } from './use-will-unmount';

export function useDidUpdate(callback: EmptyFn, conditions: unknown[]) {
  const hasMountedRef = useRef(false);
  const callbackRef = useUpdatableRef(callback);

  useEffect(() => {
    if (hasMountedRef.current) {
      callbackRef.current();
    }
  }, conditions);

  useDidMount(() => {
    hasMountedRef.current = true;
  });

  useWillUnmount(() => {
    hasMountedRef.current = false;
  });
}
