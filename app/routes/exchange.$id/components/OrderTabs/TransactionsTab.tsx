import clsx from 'clsx';
import orders from '~/mocks/transactions.json';

// icons
import ArrowDownIcon from 'app/icons/arrow-down.svg?react';

import { OrderFilters } from './components/OrderFilters';

export const TransactionsTab = () => {
  const columns = [
    {
      label: 'Date',
      field: 'date',
    },
    {
      label: 'Pair',
      field: 'pair',
    },

    {
      label: 'Side',
      field: 'side',
      sortable: true,
    },

    {
      label: 'Price',
      field: 'price',
    },
    {
      label: 'Executed',
      field: 'executed',
    },
    {
      label: 'Fee',
      field: 'fee',
    },

    {
      label: 'Executed',
      field: 'executed',
    },
    {
      label: 'Role',
      field: 'role',
    },
    {
      label: 'Total',
      field: 'total',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="my-4">
        <OrderFilters />
      </div>
      <div className="flex w-full">
        <div className="flow-root w-full">
          <div>
            <div className="px-6">
              <table className={clsx('table-fixed w-full')}>
                <thead className="border-b border-divider">
                  <tr>
                    {columns.map((column, idx) => (
                      <th
                        key={column.label.concat(idx.toString())}
                        scope="col"
                        className={clsx(
                          'whitespace-nowrap  py-3 text-caption-regular',
                          'text-left pr-2'
                        )}
                      >
                        <div className="flex items-center gap-x-1">
                          <span className={clsx('flex items-center gap-1')}>
                            {column.label}
                            {column.sortable && <ArrowDownIcon />}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {orders.map((order, index) => (
                    <tr key={`${order.date}${index}`}>
                      <td className="eq-table-cell">{order.date || ''}</td>

                      <td className="eq-table-cell">{order.pair || ''}</td>

                      <td
                        className={`eq-table-cell ${
                          order.side != 'Sell' ? 'text-success' : 'text-error'
                        }`}
                      >
                        {order.side}
                      </td>

                      <td className="eq-table-cell">{order.price || ''}</td>
                      <td className="eq-table-cell">{order.executed || ''}</td>

                      <td className="eq-table-cell">{order.fee || ''}</td>
                      <td className="eq-table-cell">{order.executed || ''}</td>
                      <td className="eq-table-cell">{order.role || ''}</td>

                      <td className="eq-table-cell">{order.total || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
