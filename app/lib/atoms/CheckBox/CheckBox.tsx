import React, {
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import clsx from 'clsx';

import OkIcon from 'app/icons/ok.svg?react';
import {
  blurHandler,
  checkedHandler,
  focusHandler,
} from '../../ui/inputHandlers';

export interface CheckboxProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'name'
    | 'checked'
    | 'className'
    | 'onFocus'
    | 'onBlur'
    | 'onClick'
    | 'disabled'
  > {
  overrideClassNames?: string;
  errored?: boolean;
  onChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  IconFromProps?: ImportedSVGComponent;
  iconClassName?: string;
  shouldFocus?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      overrideClassNames,
      errored = false,
      className,
      checked,
      onChange,
      onFocus,
      onBlur,
      IconFromProps,
      iconClassName,
      shouldFocus = true,
      ...rest
    },
    ref
  ) => {
    const [localChecked, setLocalChecked] = useState(() => checked ?? false);

    useEffect(() => {
      setLocalChecked((prevChecked) => checked ?? prevChecked);
    }, [setLocalChecked, checked]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked: toChecked } = event.target;
        checkedHandler(
          event,
          onChange && (() => onChange(toChecked, event)),
          setLocalChecked
        );
      },
      [onChange, setLocalChecked]
    );

    /**
     * Focus handling
     */
    const [localFocused, setLocalFocused] = useState(false);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) =>
        focusHandler(e, onFocus!, setLocalFocused),
      [onFocus, setLocalFocused]
    );
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) =>
        blurHandler(e, onBlur!, setLocalFocused),
      [onBlur, setLocalFocused]
    );

    const classNameMemo = useMemo(
      () =>
        clsx(
          'flex justify-center items-center flex-shrink-0 cursor-pointer',
          'text-white border-2 overflow-hidden',
          'transition ease-in-out duration-200 disable-outline-for-click',
          localFocused && shouldFocus && 'shadow-outline',
          (() => {
            switch (true) {
              case localChecked:
                return 'border-dark-green-500';
              case localFocused:
                return 'border-dark-green-400';
              case errored:
                return 'border-error';
              default:
                return 'border-dark-gray-50';
            }
          })(),
          overrideClassNames || 'h-4 w-4 rounded'
        ),
      [localChecked, localFocused, errored, overrideClassNames]
    );

    const Icon = IconFromProps ? IconFromProps : OkIcon;

    return (
      <div className={classNameMemo}>
        <input
          ref={ref}
          type="checkbox"
          className={clsx('sr-only rounded', className)}
          checked={localChecked}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        <Icon
          className={clsx(
            iconClassName
              ? iconClassName
              : 'size-4 stroke-[3px] stroke-dark-green-500 pointer-events-none',
            localChecked ? 'block' : 'hidden'
          )}
        />
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
