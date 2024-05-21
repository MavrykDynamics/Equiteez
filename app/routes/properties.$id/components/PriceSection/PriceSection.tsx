import { Divider } from '~/atoms/Divider';
import { Table } from '~/atoms/Table/Table';

// styles
import styles from './priceSection.module.css';
import clsx from 'clsx';
import { Button } from '~/atoms/Button';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { FC, useCallback, useState } from 'react';

// TODO map dynamicdata from the future API
export const PriceSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  return (
    <section className="slef-start">
      <Table>
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Starting Price</p>
          <p>$45.00</p>
        </div>
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Projected Annual Return </p>
          <p>11.88%</p>
        </div>
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Rental Yield</p>
          <p>8.88%</p>
        </div>
        <div className="text-content text-buttons flex justify-between">
          <p>Rental Yield</p>
          <p>4.83%</p>
        </div>
        <Divider className="my-4" />
        <h4 className="text-content text-buttons mb-3">Tokens Available</h4>
        <ProgresBar />
        <Button onClick={handleOpen}>Buy</Button>
      </Table>

      <PopupWithIcon isOpen={isOpen} onRequestClose={handleRequestClose}>
        <BuyPopupContent handleCancel={handleRequestClose} />
      </PopupWithIcon>
    </section>
  );
};

const ProgresBar = () => {
  return (
    <div className="flex flex-col mb-6">
      <div className={clsx(styles.progressBar, styles.progressPercentage)} />
      <div className="flex justify-between text-content text-body mt-1">
        <p>50</p>
        <p>150</p>
      </div>
    </div>
  );
};

type BuyPopupContentProps = {
  handleCancel: () => void;
};

const BuyPopupContent: FC<BuyPopupContentProps> = ({ handleCancel }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-content text-card-headline">The Cove</h2>
      <p className="text-body text-content">
        7335 Wilburton Lane, Northport, AL 35473
      </p>

      <div className="mt-6 flex flex-col mb-4">
        <div className="border border-divider rounded-lg px-4 py-3 flex justify-between mb-3">
          <span className="text-body-xs text-content-secondary opacity-50">
            Price
          </span>
          <span className="text-content text-body-xs opacity-50">
            58.00 USDT
          </span>
        </div>
        <div className="border border-divider rounded-lg px-4 py-3 flex justify-between">
          <span className="text-body-xs text-content-secondary opacity-75">
            Amount
          </span>
          <p className="text-content-secondary text-body-xs">
            <span className="opacity-50">Minimum&nbsp;</span>
            <span className="text-content">1 COVE</span>
          </p>
        </div>
        <Divider className="my-4" />
        <div className="border border-divider rounded-lg px-4 py-3 flex justify-between">
          <span className="text-body-xs text-content-secondary">Total</span>
          <p className="text-content-secondary text-body-xs">
            <span className="opacity-75">0&nbsp;</span>
            <span className="text-content">USDT</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-y-1">
        {/* TODO extract to separate component with the real api */}
        <div className="text-caption-regular text-content-secondary flex items-center justify-between">
          <span>USDT Balance</span>
          <span>1,034.75 USDT</span>
        </div>

        <div className="text-caption-regular text-content-secondary flex items-center justify-between">
          <span>Max Buy</span>
          <span>17.84 COVE</span>
        </div>

        <div className="text-caption-regular text-content-secondary flex items-center justify-between">
          <span>Est. Fee</span>
          <span>-- COVE</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button>Buy</Button>
      </div>
    </div>
  );
};
