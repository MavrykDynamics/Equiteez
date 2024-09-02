import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';

// icons
import CalendarIcon from 'app/icons/calendar.svg?react';
import { Button } from '~/lib/atoms/Button';

// consts
const PERIODS = ['1D', '1W', '1M', '3M'];

export const OrderFilters = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(() => PERIODS[0]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <section className="flex items-center gap-x-11">
      <div className="flex gap-x-3 items-center text-content text-caption-regular">
        <span>Period:</span>

        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={clsx(
              selectedPeriod === period ? 'text-dark-green-500' : 'text-content'
            )}
          >
            {period}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-x-3">
        <span className="text-content text-caption-regular">Time:</span>
        <div className="flex items-center">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            // @ts-expect-error // datePicker lib passes props
            customInput={<DatePickerInput />}
            dateFormat={'dd/MM/YY'}
          />
          <div className="w-3 h-[1px] bg-content mx-3" />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            // @ts-expect-error // datePicker lib passes props
            customInput={<DatePickerInput />}
            dateFormat={'dd/MM/YY'}
          />
        </div>

        <div className="flex gap-x-2 items-center ">
          <Button variant="dark" textVariant="caption" size="small-plus">
            Apply
          </Button>
          <Button
            variant="dark-outline"
            textVariant="caption"
            size="small-plus"
          >
            Reset
          </Button>
        </div>
      </div>
    </section>
  );
};

const DatePickerInput = forwardRef<
  HTMLDivElement,
  { value: string; onClick: () => void }
>(({ value, onClick }, ref) => (
  <div
    role="presentation"
    ref={ref}
    onClick={onClick}
    className="flex items-center py-3 px-[14px] border border-gray-100 rounded-lg cursor-pointer max-h-[34px]"
  >
    <input
      className="text-caption-regular outline-none focus:outline-none w-[78px]"
      placeholder="DD/MM/YYYY"
      value={value}
      onChange={() => {}}
    />
    <CalendarIcon className="w-4 h-4 ml-2" />
  </div>
));

DatePickerInput.displayName = 'DatePickerInput';
