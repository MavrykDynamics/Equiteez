import clsx from 'clsx';
import { FC } from 'react';

import styles from './input.module.css';

type InputProps = {
  handleValue?: (v: number | string) => void;
  label?: string | JSX.Element;
  value: number | string;
  placeholder: string;
  name: string;
  valueText?: string;
  min?: number;
  className?: string;
  labelVariant?: 'default' | 'opacity';
  disabled?: boolean;
};

const labelVariants = {
  opacity: 'text-content-secondary opacity-50',
  default: 'text-content',
};

export const InputNumber: FC<InputProps> = ({
  handleValue,
  label,
  value,
  name,
  valueText,
  placeholder,
  className,
  labelVariant = 'default',
  min = 1,
  disabled = false,
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className={clsx(labelVariants[labelVariant], 'text-body-xs')}
        >
          {label}
        </label>
      )}

      <div
        className={clsx(
          'w-full flex justify-between  py-3 px-4 text-body-xs gap-1 mt-2',
          disabled
            ? 'bg-gray-100 border-gray-300 text-dark-green-100 rounded-lg'
            : 'eq-input',
          className
        )}
      >
        <span className="w-full">
          <input
            name={name}
            type="number"
            min={min}
            value={value}
            step={0.1}
            onChange={(e) => handleValue?.(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'w-full bg-transparent focus:outline-none text-left'
            )}
          ></input>
        </span>
        {valueText && <span>{valueText}</span>}
      </div>
    </div>
  );
};

export type InputTextProps = {
  errorCaption?: string;
  focused?: boolean;
  hasIcon?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputText: FC<InputTextProps> = ({
  errorCaption,
  disabled,
  focused,
  hasIcon,
  ...rest
}) => {
  return (
    <div className="relative">
      <input
        {...rest}
        type="text"
        className={clsx(
          styles.textInput,
          'flex items-center',
          'transition duration-300 ease-in-out',
          'relative py-3  w-full',
          hasIcon ? 'pl-10 pr-4' : 'px-4',
          'text-body-xs text-content',
          disabled && styles.disabled,
          errorCaption && styles.error,
          focused && styles.focused
        )}
      />

      {errorCaption && (
        <span className={clsx('text-body-xs text-error', styles.errorCaprion)}>
          {errorCaption}
        </span>
      )}
    </div>
  );
};
