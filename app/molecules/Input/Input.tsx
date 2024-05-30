import clsx from 'clsx';
import { FC } from 'react';

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
