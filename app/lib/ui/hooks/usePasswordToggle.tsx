import React, { useCallback, useMemo, useState } from 'react';

import clsx from 'clsx';

import EyeClosedBold from 'app/icons/eye-closed-bold.svg?react';
import EyeOpenBold from 'app/icons/eye-open-bold.svg?react';
import { useDidUpdate, useTimeout } from 'app/lib/ui/hooks';
import { USER_ACTION_TIMEOUT } from '../use-blur-on-timeout';

const usePasswordToggle = (
  smallPaddings: boolean,
  id?: string,
  onReveal?: EmptyFn,
  revealRef?: unknown,
  handleBlur?: (e: React.FocusEvent) => void
): ['text' | 'password', JSX.Element] => {
  const [visible, setVisibility] = useState(false);

  const buttonId = useMemo(
    () => (id ? `passwordToggle-${id}` : undefined),
    [id]
  );

  const hide = useCallback(() => void setVisibility(false), []);

  useDidUpdate(hide, [revealRef]);

  useTimeout(hide, USER_ACTION_TIMEOUT, visible);

  const Icon = useMemo(
    () => (
      <button
        id={buttonId}
        type="button"
        // eslint-disable-next-line jsx-a11y/tabindex-no-positive
        tabIndex={1}
        className={clsx(
          'absolute inset-y-0',
          smallPaddings ? 'right-2' : 'right-3'
        )}
        onClick={() => {
          if (!visible) {
            onReveal?.();
          }
          setVisibility((prev) => !prev);
        }}
        onBlur={handleBlur}
      >
        {visible ? (
          <EyeClosedBold className="fill-accent-blue" />
        ) : (
          <EyeOpenBold className="fill-accent-blue" />
        )}
      </button>
    ),
    [smallPaddings, handleBlur, visible, onReveal]
  );

  const inputType = visible ? 'text' : 'password';

  return [inputType, Icon];
};

export default usePasswordToggle;
