// icons
import DotFill from '~/icons/dot-fill.svg?react';
import DotEmpty from '~/icons/dot-empty.svg?react';
import EQLogo from '~/icons/eq-small-logo.svg?react';
import { FC } from 'react';

const options = [0, 25, 50, 75, 100];

type ESnakeblockProps = {
  selectedOption: number;
  setSelectedOption: (option: number) => void;
};

export const ESnakeblock: FC<ESnakeblockProps> = ({
  selectedOption = 0,
  setSelectedOption,
}) => {
  const handleOptionClick = (option: number) => {
    setSelectedOption(option);
  };

  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex w-full h-3.5 relative">
        <div className="absolute w-full h-full flex justify-between z-20">
          {options.map((option, idx) => (
            <span key={option}>
              {option === selectedOption ? (
                <EQLogo className="size-3.5" />
              ) : options.length - 1 === idx ? (
                <DotFill className="size-3.5" />
              ) : (
                <DotEmpty className="size-3.5" />
              )}
            </span>
          ))}
        </div>

        <div className="absolute w-full h-full flex items-center z-10">
          <div className="w-full h-[1px] bg-divider"></div>
        </div>
      </div>

      <div className="flex w-full justify-between">
        {options.map((option) => (
          <button
            key={option}
            className="eq-slider outline-none focus:outline-none"
            onClick={() => handleOptionClick(option)}
          >
            {option}%
          </button>
        ))}
      </div>
    </div>
  );
};
