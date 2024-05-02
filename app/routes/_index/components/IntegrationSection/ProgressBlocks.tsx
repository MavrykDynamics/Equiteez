import { useEffect, useState } from 'react';
import styles from './integrationSection.module.css';
import clsx from 'clsx';

const ITEMS = [
  {
    id: 1,
    title: 'Full control of their investments',
    description:
      'Buy shares of rental properties starting at ust $50. Each token represents fractional ownership of the property. The more you own, the more you earn.',
  },
  {
    id: 2,
    title: 'Buy & Sell',
    description:
      'Buy shares of rental properties starting at ust $50. Each token represents fractional ownership of the property. The more you own, the more you earn.',
  },
  {
    id: 3,
    title: 'Stake for additional yield',
    description:
      'Buy shares of rental properties starting at ust $50. Each token represents fractional ownership of the property. The more you own, the more you earn.',
  },
];

export const ProgressBlocks = () => {
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBlockIdx((prev) => (prev === ITEMS.length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-x-6 cursor-pointer">
      {ITEMS.map((item, idx) => (
        <div key={item.id}>
          <div
            className={clsx(
              'transition delay-300',
              styles.progressBar,
              idx === activeBlockIdx && styles.progressAnimation
            )}
          />
          <div
            className={clsx(
              'transition delay-300',
              idx !== activeBlockIdx && 'opacity-50'
            )}
          >
            <h3 className="text-content text-card-headline my-3">
              {item.title}
            </h3>
            <p className="text-content text-body">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
