import { useEffect, useState } from 'react';
import styles from './integrationSection.module.css';
import clsx from 'clsx';

const ITEMS = [
  {
    id: 1,
    title: 'Secondary Market Trading',
    description:
      "Buy, sell, or trade your assets on Equiteez's secondary markets 24/7, giving you the flexibility to manage your investments anytime, day or night.",
  },
  {
    id: 2,
    title: 'Borrow Against Your Portfolio, Instantly',
    description:
      'Lock your assets in a secure vault with Maven Finance and borrow against your portfolio instantly, accessing quick loans without selling your investments.',
  },
  {
    id: 3,
    title: 'Stake For Compounded Earnings',
    description:
      "Stake your assets in Equiteez's Automated Market Maker exchange and earn compounded returns through trading fees, maximizing your earnings effortlessly over time.",
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
