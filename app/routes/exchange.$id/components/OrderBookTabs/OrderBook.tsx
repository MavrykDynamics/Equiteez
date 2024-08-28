import orderbook from '~/mocks/orderbook.json';
import RedArrowDown from '~/icons/red-arrow-down.svg?react';
import clsx from 'clsx';

import styles from './orderbook.module.css';

export const OrderBook = () => {
  const columns = [
    {
      label: 'Price (USDT)',
      field: 'price',
    },
    {
      label: 'Amount',
      field: 'amount',
    },
    {
      label: 'Total',
      field: 'total',
    },
  ];

  const currentPrice = 51;

  return (
    <div className="flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table
            className={clsx(
              'min-w-full divide-y divide-divider',
              styles.orderTable
            )}
          >
            <thead>
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={column.label}
                    scope="col"
                    className={clsx(
                      'whitespace-nowrap py-2 text-left text-caption-regular',
                      idx === 0 ? 'text-left' : 'text-right'
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {orderbook.map((order, index) => (
                <tr key={`${order.price}${index}`}>
                  {Number(order.price) == currentPrice ? (
                    <td
                      className={`whitespace-nowrap flex items-center text-body-xs gap-1 pr-2 py-1 text-error ${
                        Number(order.price) > currentPrice
                          ? 'text-success'
                          : 'text-error'
                      }`}
                    >
                      <span>{order.price}</span>
                      <RedArrowDown className="w-4 h-4" />
                    </td>
                  ) : (
                    <td
                      className={`eq-table-cell-small text-caption-regular ${
                        Number(order.price) > currentPrice
                          ? 'text-success'
                          : 'text-error'
                      }`}
                    >
                      {order.price}
                    </td>
                  )}

                  <td className="eq-table-cell-small text-right">
                    {order.amount || ''}
                  </td>

                  <td className="eq-table-cell-small text-right">
                    {order.total || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
