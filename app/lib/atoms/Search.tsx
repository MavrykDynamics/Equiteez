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
        'py-3 px-[14px] rounded-lg overflow-hidden border border-gray-100 w-full',
        'flex items-center gap-2'
      )}
    >
      <SearchIcon className="size-4 text-sand-900 stroke-current" />
      <input
        className={clsx(
          'flex-1 flex-grow outline-none focus:outline-none text-caption-regular focus:border-red-100'
        )}
        {...rest}
        type="text"
      />
      {showSearchIcon && (
        <div className="size-4 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
          <button onClick={handleClose}>
            <CrossIcon className="w-[10px] h-[10px] text-content stroke-current" />
          </button>
        </div>
      )}
    </div>
  );
};
