import { useCallback, useEffect, useRef } from 'react';

import tippy, { Props, Instance } from 'tippy.js';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

export type TippyInstance = Instance<Props>;

export type UseTippyOptions = Partial<Props>;

export const useTippyById = (parentId: string, props: UseTippyOptions) => {
  const onMouseEnter = useCallback(() => {
    const _props = { theme: 'equiteez', ...props };

    tippy(parentId, _props);
  }, [parentId, props]);

  return onMouseEnter;
};

export default function useTippy<T extends HTMLElement>(
  props: UseTippyOptions
) {
  const { IS_WEB } = useAppContext();
  const targetRef = useRef<T>(null);
  const instanceRef = useRef<Instance<Props>>();

  useEffect(() => {
    if (IS_WEB) {
      const _props = { theme: 'equiteez', ...props };

      if (instanceRef.current) {
        instanceRef.current.setProps(_props);
      } else if (targetRef.current) {
        instanceRef.current = tippy(targetRef.current, _props);
      }
    }
  }, [IS_WEB, props]);

  useEffect(
    () => () => {
      if (instanceRef.current && !IS_WEB) {
        instanceRef.current?.destroy();
      }
    },
    [IS_WEB]
  );

  return targetRef;
}
