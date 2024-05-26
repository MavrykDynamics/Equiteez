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
  disabled?: boolean;
};

export const InputNumber: FC<InputProps> = ({
  handleValue,
  label,
  value,
  name,
  valueText,
  placeholder,
  className,
  min = 1,
  disabled = false,
}) => {
  return (
    <div
      className={clsx('w-full flex justify-between eq-input p-3', className)}
    >
      <span className="text-content-secondary opacity-50">{label}</span>

      <span className="flex gap-1 flex-1 text-right">
        <span className="w-full">
          <input
            name={name}
            type="number"
            min={min}
            value={value}
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
