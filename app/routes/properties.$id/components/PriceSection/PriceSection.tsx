import { Divider } from '~/atoms/Divider';
import { Table } from '~/atoms/Table/Table';

// styles
import styles from './priceSection.module.css';
import clsx from 'clsx';
import { Button } from '~/atoms/Button';

// TODO map dynamicdata from the future API
export const PriceSection = () => {
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
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Rental Yield</p>
          <p>4.83%</p>
        </div>
        <Divider className="my-4" />
        <h4 className="text-content text-buttons mb-3">Tokens Available</h4>
        <ProgresBar />
        <Button>Buy</Button>
      </Table>
    </section>
  );
};

const ProgresBar = () => {
  return (
    <div className="flex flex-col mb-6">
      <div className={clsx(styles.progressBar, styles.progressPercentage)} />
      <div className="flex justify-between text-content text-body">
        <p>50</p>
        <p>150</p>
      </div>
    </div>
  );
};
