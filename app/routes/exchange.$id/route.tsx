import type { MetaFunction } from '@remix-run/node';
import { Link, Navigate, useParams } from '@remix-run/react';
import Star from 'app/icons/star.svg?react';
import Search from 'app/icons/search.svg?react';
import ArrowDown from 'app/icons/arrow-down.svg?react';
import ArrowUp from 'app/icons/arrow-up.svg?react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';

import { Divider } from '~/atoms/Divider';
import { Spacer } from '~/atoms/Spacer';

import estates from 'app/mocks/estates.json';

// styles
// import styles from './propertyId.module.css';

// mocked faq data
import { ExchangeTabs } from './components/ExchangeTabs/ExchangeTabs';
import { OrderTabs } from './components/OrderTabs/OrderTabs';
import { BuySellTabs } from './components/BuySellTabs/BuySellTabs';

import { TabSmall } from './components/TabSmall/TabSmall';
import { OrderBookTabs } from './components/OrderBookTabs/OrderBookTabs';

import assetsList from '~/mocks/assetsList.json';

export const meta: MetaFunction = () => {
  return [
    { title: 'Exchange' },
    { name: 'description', content: 'Exchange data' },
  ];
};
export default function ExchangeDetails() {
  const { id } = useParams();

  const estateData = estates.find((estate) => estate.id === id);

  if (!estateData) return <Navigate to={'/exchange'} />;

  const assetsColumns = [
    {
      label: 'Name',
      field: 'name',
    },
    {
      label: 'Price (USDT)',
      field: 'price_usdt_1',
    },
    {
      label: 'Change',
      field: 'change',
    },
  ];

  return (
    <PageLayout>
      <section className="px-11">
        <div className="flex flex-col mt-8">
          <Divider className="" />
        </div>
        <div className="flex w-full py-4 gap-[54px]">
          {/* Top Bar */}
          <div className="flex flex-grow gap-[86px]">
            {/* Market Searcher/Chooser */}
            <div className="flex items-center relative">
              {/* <button className="w-full flex py-2.5 px-4 justify-start items-center gap-2.5 bg-transparent border border-green-main rounded-2xl" type="button">

                <img src={estateData.imgSrc} alt={'icon'} className="size-12 rounded-full" />

                <span className="flex items-center text-card-headline" role="none">The Cove/USDT</span>

                <ChevronDown />
              </button> */}

              {/* TODO fix this menu layoutshit bug, as quick fix width is 300 */}
              <Menu as="div" className="w-[300px]">
                {({ open }) => (
                  <>
                    <div>
                      <Menu.Button
                        className={`w-full flex py-2.5 px-4 justify-start items-center gap-2.5 bg-transparent border border-green-main rounded-2xl`}
                      >
                        <img
                          src={estateData.imgSrc}
                          alt={'icon'}
                          className="size-12 rounded-full"
                        />

                        <span
                          className="flex items-center text-card-headline"
                          role="none"
                        >
                          {estateData.title}/USDT
                        </span>

                        {open ? <ArrowUp /> : <ArrowDown />}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        style={{ top: 'calc(100% + 4px)' }}
                        className="absolute right-0 z-50 origin-top-right w-full eq-dropdown-menu max-h-36 mt-0 overflow-y-auto"
                      >
                        {estates.map((row) => (
                          <div key={row.title} className="">
                            <Menu.Item>
                              <Link
                                to={`/exchange/${row.id}`}
                                className="eq-dropdown-item gap-2.5"
                              >
                                <img
                                  src={row.imgSrc}
                                  alt={'icon'}
                                  className="size-8 rounded-full"
                                />
                                <span className="me-auto">
                                  {row.title}/USDT
                                </span>
                              </Link>
                            </Menu.Item>
                          </div>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
            </div>

            {/* Highlights */}
            <div className="flex justify-between items-center">
              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs">Asset Type</span>
                <span className="text-card-headline">{estateData.symbol}</span>
              </span>

              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs">Price</span>
                <span className="text-card-headline">$8.00</span>
              </span>

              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs">24h Change</span>
                <span className="text-card-headline">+5.04%</span>
              </span>

              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs flex items-center gap-1">
                  <ArrowUp className="size-4" />
                  24h High
                </span>
                <span className="text-card-headline">$8.20</span>
              </span>

              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs flex items-center gap-1">
                  <ArrowDown className="size-4" />
                  24h Low
                </span>
                <span className="text-card-headline">$7.89</span>
              </span>

              <span className="min-w-[120px] flex flex-col">
                <span className="text-body-xs">Yield</span>
                <span className="text-card-headline">4.83%</span>
              </span>
            </div>
          </div>

          {/* Back to Asset */}
          <div className="flex items-center">
            <button className="text-green-main text-buttons flex items-center gap-x-1">
              <p>View Asset</p>
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <Divider className="" />
        </div>

        <div className="flex w-full">
          {/* Asset Search */}
          <div className="flex flex-col w-80 py-6 pe-6">
            {/* Header */}
            <div className="flex justify-between">
              <span className="text-buttons">Assets</span>
              <button className="text-green-main text-body-xs flex items-center gap-x-1">
                <p>View All</p>
              </button>
            </div>

            {/* Main*/}
            <div className="flex flex-col gap-4 pt-4">
              {/* Search Box*/}
              <div className="w-full flex">
                <span
                  className={`w-full flex text-body-xs justify-start items-center px-4 py-3 gap-2 bg-inactive-tab rounded-lg`}
                >
                  <Search className="w-[14px] h-[14px] text-content stroke-current" />
                  <input
                    name="term"
                    type="text"
                    placeholder={`Search Assets`}
                    className="w-full bg-transparent focus:outline-none"
                  ></input>
                </span>
              </div>

              {/* Filters/Icons */}
              <div className="w-full flex justify-start gap-1">
                <TabSmall>
                  <Star className="size-4" />
                </TabSmall>
                <TabSmall>OTC</TabSmall>
              </div>

              {/* Results */}
              <div className="">
                <div className="flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="whitespace-nowrap p-2 text-left text-caption-regular min-w-7"
                            ></th>
                            {assetsColumns.map((column) => (
                              <th
                                key={column.label}
                                scope="col"
                                className="whitespace-nowrap p-2 text-left text-caption-regular"
                              >
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-transparent bg-white">
                          {assetsList.map((asset) => (
                            <tr key={asset.name} className="h-11">
                              <td className="whitespace-nowrap p-2 pl-1 cursor-pointer">
                                <Star />
                              </td>

                              <td className="eq-table-cell">{asset.name}</td>

                              <td className="eq-table-cell">
                                {asset.price_usdt_1}
                              </td>

                              <td className="eq-table-cell text-success">
                                {asset.change}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={'h-100 w-[1px] bg-divider'} />

          {/* Mid Panel */}
          <div className="flex flex-grow p-6">
            <ExchangeTabs />
          </div>

          <div className={'h-100 w-[1px] bg-divider'} />

          {/* Actions */}
          <div className="flex flex-col w-80">
            {/* Buy/Sell Shares */}
            <div className="flex flex-col w-80 py-6 ps-6">
              <BuySellTabs symbol={estateData.symbol} />
            </div>
            <Divider className="" />

            {/* Order Book View */}
            <div className="flex flex-col w-80 py-6 ps-6">
              <OrderBookTabs />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <Divider className="" />
        </div>

        {/* Order/History/Transactions */}
        <div className="flex flex-col w-full py-6 pe-6">
          <OrderTabs />
        </div>
      </section>
      <Spacer className="h-[200px]" />
    </PageLayout>
  );
}
