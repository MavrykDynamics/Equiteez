import clsx from 'clsx';
import { FC } from 'react';

import styles from './input.module.css';

type InputProps = {
  handleValue?: (v: number | string) => void;
  label: string;
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
    <div
      className={clsx(
        'w-full flex justify-between eq-input py-3 px-4 text-body-xs',
        className
      )}
    >
      <span className={clsx(labelVariants[labelVariant])}>{label}</span>

      <span className="flex gap-1 flex-1 text-right">
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
              'w-full bg-transparent focus:outline-none text-right'
            )}
          ></input>
        </span>
        {valueText && <span>{valueText}</span>}
      </span>
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
