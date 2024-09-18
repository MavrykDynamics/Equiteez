// icons
import SearchIcon from 'app/icons/search.svg?react';
import CrossIcon from 'app/icons/cross.svg?react';

import styles from './inputWithIcons.module.css';
import { FC } from 'react';

import { InputText, InputTextProps } from '~/lib/molecules/Input/Input';
import clsx from 'clsx';
import { useOutsideClick } from '~/lib/ui/use-click-outside';

type InputWithIconsProps = {
  showSearchIcon?: boolean;
  handleClose: () => void;
  triggerOutSideClick?: boolean;
} & InputTextProps;

export const InputWithIcons: FC<InputWithIconsProps> = ({
  showSearchIcon,
  handleClose,
  triggerOutSideClick = true,
  ...rest
}) => {
  const ref = useOutsideClick(handleClose, !triggerOutSideClick);

  return (
    <div ref={ref} className="relative">
      {showSearchIcon && <SearchIcon className={styles.searchIcon} />}
      <button
        onClick={handleClose}
        className={clsx(
          styles.closeIcon,
          'p-1 rounded-full bg-dark-green-opacity'
        )}
      >
        <CrossIcon className="w-4 h-4 text-content stroke-current" />
      </button>
      <InputText {...rest} hasIcon />
    </div>
  );
};
