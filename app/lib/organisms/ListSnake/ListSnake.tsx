import { FC } from 'react';

import styles from './listSnake.module.css';
import clsx from 'clsx';

type ListSnakeProps = {
  items: (string | JSX.Element)[];
};

export const ListSnake: FC<ListSnakeProps> = ({ items }) => {
  return (
    <ol className={clsx(styles.stepper, 'flex flex-col items-start gap-y-6')}>
      {items.map((item, i) => (
        <li
          key={i}
          className="text-card-headline text-content flex items-center"
        >
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
};
