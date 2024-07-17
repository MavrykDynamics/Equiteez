import React, { forwardRef, ReactNode, useCallback } from 'react';

import classNames, { clsx } from 'clsx';

import { CheckboxProps, Checkbox } from '../atoms/CheckBox';

export interface FormCheckboxProps extends CheckboxProps {
  label?: ReactNode;
  labelDescription?: ReactNode;
  errorCaption?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      labelDescription,
      errorCaption,
      containerClassName,
      labelClassName,
      onChange,
      ...rest
    },
    ref
  ) => {
    const handleChange = useCallback(
      (toChecked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(toChecked, event);
      },
      [onChange]
    );

    return (
      <div className={classNames('flex flex-col', containerClassName)}>
        <label
          className={clsx(
            'flex items-start',
            'rounded overflow-hidden cursor-pointer bg-primary-bg',
            labelClassName
          )}
        >
          <Checkbox
            ref={ref}
            errored={Boolean(errorCaption)}
            onChange={handleChange}
            {...rest}
          />

          {label && (
            <div className="ml-2 flex flex-col">
              <span className="text-sm text-white">{label}</span>

              {labelDescription && (
                <span className="mt-1 text-xs font-light text-secondary-white">
                  {labelDescription}
                </span>
              )}
            </div>
          )}
        </label>

        {errorCaption && (
          <div className="text-sm text-error">{errorCaption}</div>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
