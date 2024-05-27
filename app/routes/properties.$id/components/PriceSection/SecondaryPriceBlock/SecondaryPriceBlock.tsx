import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '~/atoms/Button';
import { Divider } from '~/atoms/Divider';
import { TabType } from '~/atoms/Tab';
import { Table } from '~/atoms/Table/Table';
import { faucetContract } from '~/consts/contracts';
import { useStatusFlag } from '~/hooks/use-status-flag';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { PriceBuyTab } from './PriceBuyTab';
import { PriceOTCBuyTab } from './PriceOTCBuyTab';
import { MakeOfferScreen } from './MakeOfferScreen';

export const SecondaryPriceBlock = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

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
        <Button variant="outline" className="mt-3">
          Sell
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
  const [isOfferScreen, setIsOfferScreen] = useState(false);

  const {
    setPending,
    setConfirming,
    setSuccess,
    setIdle,
    setError,
    isLoading,
    status,
  } = useStatusFlag();

  const toggleMakeOfferScreen = useCallback(() => {
    setIsOfferScreen(!isOfferScreen);
  }, [isOfferScreen]);

  const handleBuy = useCallback(async () => {
    setPending();

    const tezos = dapp?.tezos();

    // No Toolkit
    if (!tezos) {
      setIdle();
      return;
    }

    try {
      let batch = tezos.wallet.batch([]);

      const faucet = await tezos.wallet.at(faucetContract);

      const action = faucet.methodsObject['default']().toTransferParams();

      batch = batch.withTransfer(action);

      console.log('Batch');
      console.log(batch);

      const batchOp = await batch.send();

      setConfirming();

      await batchOp.confirmation();

      setSuccess();
    } catch (e: unknown) {
      console.log(e);
      setError();
    }
  }, [dapp, setConfirming, setError, setIdle, setPending, setSuccess]);

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
            <h3 className="text-card-headline">The Nomad</h3>
            <p className="text-body-xs mb-6">
              15995 Glenncrest Lane Northwest, Harvest, AL 35749
            </p>

            <TabSwitcher tabs={tabs} activeTabId={activetabId} />
            <BuyTab
              tabId={activetabId}
              toggleMakeOfferScreen={toggleMakeOfferScreen}
            />
          </div>
          <Button disabled={isLoading} onClick={handleBuy}>
            {status === 'pending' && 'Pending...'}
            {status === 'confirming' && 'Confirming...'}
            {(status === 'idle' || status === 'success') && 'Buy'}
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
