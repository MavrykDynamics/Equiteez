import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';

import orderbook from '~/mocks/orderbook.json';
import RedArrowDown from '~/icons/red-arrow-down.svg?react';



export const OrderBook = () => {

  const columns = [{
    label: 'Price (USDT)',
    field: 'price'
  },{
    label: 'Amount',
    field: 'amount'
  },{
    label: 'Total',
    field: 'total'
  },]

  const currentPrice = 51;

  return (
    <div className="">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {columns.map((column) => (
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
                {orderbook.map((order, index) => (
                  <tr key={`${order.price}${index}`}>


                    {
                      Number(order.price) == currentPrice ? 
                        <td className={`whitespace-nowrap flex items-center text-buttons gap-1 p-2 text-error ${ Number(order.price) > currentPrice ? 'text-success' : 'text-error' }`}>
                          <span>{order.price}</span>
                          <RedArrowDown />
                        </td>
                      :
                        <td className={`eq-table-cell ${ Number(order.price) > currentPrice ? 'text-success' : 'text-error' }`}>
                          {order.price}
                        </td>
                    } 

                    <td className="eq-table-cell">
                      {order.amount || ''}
                    </td>

                    <td className="eq-table-cell">
                      {order.total || ''}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};