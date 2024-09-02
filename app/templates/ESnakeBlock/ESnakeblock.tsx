// icons
import DotFill from '~/icons/dot-fill.svg?react';
import DotEmpty from '~/icons/dot-empty.svg?react';
import EQLogo from '~/icons/eq-small-logo.svg?react';
import { FC } from 'react';

import styles from './eSnakeBlock.module.css';
import clsx from 'clsx';

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
    <div className="flex flex-col w-full">
      <div className="flex w-full h-4 relative">
        <div
          style={{ zIndex: 5 }}
          className={clsx(
            'absolute w-full h-full flex justify-between',
            'transition 0.3s linear'
          )}
        >
          {options.map((option, idx) => (
            <span
              role="presentation"
              key={option}
              className="cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option === selectedOption ? (
                <EQLogo className="size-4 text-dark-green-500 stroke-current" />
              ) : options.length - 1 === idx ? (
                <DotFill className="size-4 fill-dark-green-200" />
              ) : selectedOption > option ? (
                <div className="size-4 bg-transparent"></div>
              ) : (
                <DotEmpty className="size-4 text-dark-green-200 stroke-current" />
              )}
            </span>
          ))}
        </div>

        <div
          style={
            { '--percentage': `${selectedOption}%` } as React.CSSProperties
          }
          className="absolute w-full h-full flex items-center z-1"
        >
          <div
            className={clsx(styles.progressBar, styles.progressPercentage)}
          />
        </div>
      </div>

      <div className="flex w-full justify-between">
        {options.map((option) => (
          <button
            key={option}
            className={clsx(
              'eq-slider outline-none focus:outline-none pt-1',
              option !== 0 && option !== 100 && 'pl-[15px]'
            )}
            onClick={() => handleOptionClick(option)}
          >
            {option}%
          </button>
        ))}
      </div>
    </div>
  );
};
