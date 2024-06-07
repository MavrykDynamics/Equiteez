// icons
import SearchIcon from 'app/icons/search.svg?react';
import CrossIcon from 'app/icons/cross.svg?react';

import styles from './inputWithIcons.module.css';
import { FC } from 'react';

import { InputText, InputTextProps } from '~/molecules/Input/Input';
import clsx from 'clsx';
import { useOutsideClick } from '~/hooks/use-click-outside';

type InputWithIconsProps = {
  showSearchIcon?: boolean;
  handleClose: () => void;
} & InputTextProps;

export const InputWithIcons: FC<InputWithIconsProps> = ({
  showSearchIcon,
  handleClose,
  ...rest
}) => {
  const ref = useOutsideClick(handleClose);

  return (
    <div ref={ref} className="relative">
      {showSearchIcon && <SearchIcon className={styles.searchIcon} />}
      <button
        onClick={handleClose}
        className={clsx(styles.closeIcon, 'p-1 rounded-full bg-green-opacity')}
      >
        <CrossIcon className="w-4 h-4 text-content stroke-current" />
      </button>
      <InputText {...rest} hasIcon />
    </div>
  );
};
