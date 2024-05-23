import { Button } from '~/atoms/Button';
import { Divider } from '~/atoms/Divider';
import { Table } from '~/atoms/Table/Table';

export const SecondaryPriceBlock = () => {
  return (
    <section className="self-start">
      <Table>
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <p>$45.00</p>
        </div>
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Annual Return</p>
          <p>8.88%</p>
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
        <div className="text-content text-buttons flex justify-between mb-6">
          <p>Total Liquidity</p>
          <p>$100,000.00</p>
        </div>
        <Button>Buy</Button>
        <Button variant="outline" className="mt-3">
          Sell
        </Button>
      </Table>

      {/* <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'center'}
      >
        <BuyPopupContent handleCancel={handleRequestClose} />
      </PopupWithIcon> */}
    </section>
  );
};
