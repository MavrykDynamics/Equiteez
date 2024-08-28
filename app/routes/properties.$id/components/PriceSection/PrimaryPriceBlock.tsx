import { Divider } from '~/lib/atoms/Divider';
import { Table } from '~/lib/atoms/Table/Table';

// styles
import styles from './priceSection.module.css';
import clsx from 'clsx';
import { Button } from '~/lib/atoms/Button';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { FC, useCallback, useState } from 'react';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { PrimaryEstate } from '~/providers/EstatesProvider/estates.types';
import { PopupContent } from './popups';

export const PrimaryPriceBlock = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeEstate } = useEstatesContext();

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  if (!activeEstate) return <>Loading...</>;
  const estate = activeEstate as PrimaryEstate;

  return (
    <section className="self-start">
      <Table>
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Starting Price</p>
          <p>${estate.assetDetails.priceDetails.price}</p>
        </div>
        <div className="text-content text-body flex justify-between mb-4">
          <div className="flex items-center gap-x-1">
            Annual Return
            <InfoTooltip content="Annual Return" className="w-6 h-6" />
          </div>
          <p>{estate.assetDetails.priceDetails.projectedAnnualReturn}%</p>
        </div>
        <div className="text-content text-body flex justify-between mb-4">
          <div className="flex items-center gap-x-1">
            Rental Yield
            <InfoTooltip content="Rental Yield" className="w-6 h-6" />
          </div>
          <p>{estate.assetDetails.priceDetails.projectedRentalYield}%</p>
        </div>
        <div className="text-content text-body flex justify-between">
          <div className="flex items-center gap-x-1">
            Investors
            <InfoTooltip content="Investors" className="w-6 h-6" />
          </div>
          <p>{estate.assetDetails.offering.minInvestmentAmount}</p>
        </div>
        <Divider className="my-4" />
        <h4 className="text-content text-body mb-3 font-semibold">Shares</h4>
        <ProgresBar
          tokensCount={estate.assetDetails.priceDetails.tokensAvailable}
        />
        <Button onClick={handleOpen}>Buy</Button>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <PopupContent estate={estate} orderType={'buy'} />
      </PopupWithIcon>
    </section>
  );
};

const ProgresBar: FC<{ tokensCount: number }> = ({ tokensCount }) => {
  return (
    <div className="flex flex-col mb-6">
      <div className={clsx(styles.progressBar, styles.progressPercentage)} />
      <div className="flex justify-between text-content text-body mt-1">
        <p>{Math.floor(tokensCount / 10)}</p>
        <p>{tokensCount}</p>
      </div>
    </div>
  );
};

// __________________________OLD VERSION__________________________

// type BuyPopupContentProps = {
//   handleCancel: () => void;
//   estate: PrimaryEstate;
// };

// const BuyPopupContent: FC<BuyPopupContentProps> = ({
//   handleCancel,
//   estate,
// }) => {
//   return (
//     <div className="flex flex-col">
//       <h2 className="text-content text-card-headline">{estate.name}</h2>
//       <p className="text-body text-content">
//         {estate.assetDetails.propertyDetails.fullAddress}
//       </p>

//       <div className="mt-6 flex flex-col mb-4">
//         <div className="border border-divider rounded-lg px-4 py-3 flex justify-between mb-3">
//           <span className="text-body-xs text-content-secondary opacity-50">
//             Price
//           </span>
//           <span className="text-content text-body-xs opacity-50">
//             58.00 USDT
//           </span>
//         </div>
//         <div className="border border-divider rounded-lg px-4 py-3 flex justify-between">
//           <span className="text-body-xs text-content-secondary opacity-75">
//             Amount
//           </span>
//           <p className="text-content-secondary text-body-xs">
//             <span className="opacity-50">Minimum&nbsp;</span>
//             <span className="text-content">1 COVE</span>
//           </p>
//         </div>
//         <Divider className="my-4" />
//         <div className="border border-divider rounded-lg px-4 py-3 flex justify-between">
//           <span className="text-body-xs text-content-secondary">Total</span>
//           <p className="text-content-secondary text-body-xs">
//             <span className="opacity-75">0&nbsp;</span>
//             <span className="text-content">USDT</span>
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col gap-y-1">
//         {/* TODO extract to separate component with the real api */}
//         <div className="text-caption-regular text-content-secondary flex items-center justify-between">
//           <span>USDT Balance</span>
//           <span>1,034.75 USDT</span>
//         </div>

//         <div className="text-caption-regular text-content-secondary flex items-center justify-between">
//           <span>Max Buy</span>
//           <span>17.84 COVE</span>
//         </div>

//         <div className="text-caption-regular text-content-secondary flex items-center justify-between">
//           <span>Est. Fee</span>
//           <span>-- COVE</span>
//         </div>
//       </div>

//       <div className="mt-4 grid grid-cols-2 gap-x-4">
//         <Button variant="outline" onClick={handleCancel}>
//           Cancel
//         </Button>
//         <Button
//           // disabled={isLoading}
//           variant="green-secondary"
//           // onClick={handleFakeBuy}
//         >
//           {getStatusLabel(STATUS_IDLE, 'Buy')}
//         </Button>
//       </div>
//     </div>
//   );
// };
