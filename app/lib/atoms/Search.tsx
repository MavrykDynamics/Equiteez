import clsx from 'clsx';
import { FC } from 'react';

// icons
import SearchIcon from 'app/icons/search.svg?react';
import CrossIcon from 'app/icons/cross.svg?react';

export type SearchProps = {
  showSearchIcon?: boolean;
  handleClose: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Search: FC<SearchProps> = ({
  handleClose,
  showSearchIcon = true,
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'py-3 px-[14px] rounded-lg overflow-hidden border border-gray-100',
        'flex items-center gap-x-2'
      )}
    >
      <SearchIcon className="w-4 h-4 text-dark-green-500 stroke current" />
      <input
        className={clsx(
          'w-full outline-none focus:outline-none text-caption-regular'
        )}
        {...rest}
        type="text"
      />
      {showSearchIcon && (
        <button
          className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
          onClick={handleClose}
        >
          <CrossIcon className="w-[10px] h-[10px] text-content stroke-current" />
        </button>
      )}
    </div>
  );
};
