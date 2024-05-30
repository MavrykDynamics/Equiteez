import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '~/atoms/Button';
import { Divider } from '~/atoms/Divider';
import { TabType } from '~/atoms/Tab';
import { Table } from '~/atoms/Table/Table';
import { oceanContract } from '~/consts/contracts';
import {
  getStatusLabel,
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { PriceBuyTab } from './PriceBuyTab';
import { PriceOTCBuyTab } from './PriceOTCBuyTab';
import { MakeOfferScreen } from './MakeOfferScreen';

// contract actions
import { sell, buy } from '../actions/financial.actions';

export const SecondaryPriceBlock = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { status, dispatch } = useStatusFlag();
  const { dapp } = useWalletContext();

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSell = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await sell(tezos, oceanContract, dispatch);
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contact error');
    }
  }, [dapp, dispatch]);

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
        <Button onClick={handleOpen}>Buy</Button>
        <Button variant="outline" className="mt-3" onClick={handleSell}>
          {getStatusLabel(status, 'Sell')}
        </Button>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <BuyPopupContent />
      </PopupWithIcon>
    </section>
  );
};

const BuyPopupContent: FC = () => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  // const {
  //   status: matchStatus,
  //   dispatch: matchDispatch,
  //   isLoading: matchIsLoading,
  // } = useStatusFlag();
  const [isOfferScreen, setIsOfferScreen] = useState(false);

  const toggleMakeOfferScreen = useCallback(() => {
    setIsOfferScreen(!isOfferScreen);
  }, [isOfferScreen]);

  const handleBuy = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await buy(tezos, oceanContract, dispatch);
    } catch (e: unknown) {
      console.log(e);
    }
  }, [dapp, dispatch]);

  // const handleMatch = useCallback(async () => {
  //   try {
  //     matchDispatch(STATUS_PENDING);

  //     const tezos = dapp?.tezos();

  //     // No Toolkit
  //     if (!tezos) {
  //       matchDispatch(STATUS_IDLE);
  //       return;
  //     }
  //     await matchOrders(tezos, oceanContract, matchDispatch);
  //   } catch (e: unknown) {
  //     console.log(e);
  //   }
  // }, [dapp, matchDispatch]);

  const [activetabId, setAvtiveTabId] = useState('buy');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'buy',
        label: 'Buy',
        handleClick: handleTabClick,
      },
      {
        id: 'otcBuy',
        label: 'OTC Buy',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <div className="flex flex-col justify-between text-content h-full">
      {isOfferScreen ? (
        <MakeOfferScreen toggleMakeOfferScreen={toggleMakeOfferScreen} />
      ) : (
        <>
          <div className="flex-1">
            <h3 className="text-card-headline">Ocean Front</h3>
            <p className="text-body-xs mb-6">
              335 Wilburton Lane, Northport, AL 35473
            </p>

            <TabSwitcher tabs={tabs} activeTabId={activetabId} />
            <BuyTab
              tabId={activetabId}
              toggleMakeOfferScreen={toggleMakeOfferScreen}
            />
          </div>
          {/* <Button
            onClick={handleMatch}
            className="mb-4"
            disabled={matchIsLoading}
          >
            {getStatusLabel(matchStatus, 'Match orders')}
          </Button> */}
          <Button disabled={isLoading} onClick={handleBuy}>
            {getStatusLabel(status, 'Buy')}
          </Button>
        </>
      )}
    </div>
  );
};

type BuyTabKey = keyof typeof buyTabsComponents;

type BuyTabProps = {
  tabId: string;
  toggleMakeOfferScreen?: () => void;
};

const BuyTab: FC<BuyTabProps> = ({ tabId, toggleMakeOfferScreen }) => {
  const Component = buyTabsComponents[tabId as BuyTabKey];

  return React.cloneElement(Component, { toggleMakeOfferScreen });
};

const buyTabsComponents = {
  buy: <PriceBuyTab />,
  otcBuy: <PriceOTCBuyTab />,
};
