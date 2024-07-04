import clsx from 'clsx';
import orders from '~/mocks/orders.json';

// icons
import TrashIcon from '~/icons/trash.svg?react';
import { OrderFilters } from './components/OrderFilters';

export const OpenHistory = () => {
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
      label: 'Type',
      field: 'type',
    },
    {
      label: 'Side',
      field: 'side',
    },
    {
      label: 'Average',
      field: 'average',
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
      label: 'Amount',
      field: 'amount',
    },

    {
      label: 'Total',
      field: 'total',
    },
    {
      label: 'Trigger Conditions',
      field: 'trigger_conditions',
    },
    {
      label: 'Status',
      field: 'status',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="my-4">
        <OrderFilters />
      </div>
      <div className="flex w-full">
        <div className="flow-root w-full">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="table-fixed w-full">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.label}
                        scope="col"
                        className={clsx(
                          'whitespace-nowrap  py-3 text-caption-regular',
                          column.field === 'clear_all'
                            ? 'flex justify-end font-semibold'
                            : 'text-left pr-2'
                        )}
                      >
                        {column.field === 'clear_all' ? (
                          <button className="flex items-center gap-1">
                            {column.label}
                          </button>
                        ) : (
                          <span className={clsx('flex items-center gap-1')}>
                            {column.label}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent bg-white">
                  {orders.map((order, index) => (
                    <tr key={`${order.date}${index}`}>
                      <td className="eq-table-cell">{order.date || ''}</td>

                      <td className="eq-table-cell">{order.pair || ''}</td>

                      <td className="eq-table-cell">{order.type || ''}</td>

                      <td
                        className={`eq-table-cell ${
                          order.side != 'Sell' ? 'text-success' : 'text-error'
                        }`}
                      >
                        {order.side}
                      </td>

                      <td className="eq-table-cell">{order.price || ''}</td>

                      <td className="eq-table-cell">{order.amount || ''}</td>

                      <td className="eq-table-cell">{order.filled || ''}</td>

                      <td className="eq-table-cell">{order.total || ''}</td>

                      <td className="eq-table-cell">
                        {order.trigger_conditions || ''}
                      </td>

                      <td className="eq-table-cell flex justify-end">
                        <button>
                          <TrashIcon className="w-4 h-4 stroke-current" />
                        </button>
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
  );
};
