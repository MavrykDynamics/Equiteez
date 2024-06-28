import orders from '~/mocks/orders.json';

import { Button } from '~/lib/atoms/Button';
// import MenuMulti from '../BuySellTabs/MenuMulti';
import Calendar from '~/icons/calendar.svg?react';
import Plus from '~/icons/plus.svg?react';

import ArrowDown from '~/icons/chevron-down.svg?react';

export const HistoryTab = () => {
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
      sortable: true,
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
      label: 'All',
      field: 'all',
      sortable: true,
    },
  ];

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex w-full gap-4 ">
        <div className="flex relative">
          {/* <MenuMulti choose="1D" items={['1D', '1W', '1M']}></MenuMulti> */}
        </div>

        <div className="flex gap-3">
          <div
            className={`w-full flex px-3 py-2.5 justify-between eq-input max-w-40 gap-3`}
          >
            <input
              name="amount"
              type="number"
              placeholder="DD/MM/YYYY"
              className="w-full bg-transparent focus:outline-none"
            ></input>
            <Calendar className="size-6" />
          </div>

          <div className="flex w-3 h-full items-center">
            <div className="w-full h-[2px] bg-content-secondary"></div>
          </div>

          <div
            className={`w-full flex px-3 py-2.5 justify-between eq-input max-w-40 gap-3`}
          >
            <input
              name="amount"
              type="number"
              placeholder="DD/MM/YYYY"
              className="w-full bg-transparent focus:outline-none"
            ></input>
            <Calendar className="size-6" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="">Apply</Button>
          <Button
            className="opacity-50 pointer-events-none"
            variant="outline"
            size="outline"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex w-full">
        <div className="flow-root w-full">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap p-2 text-left text-caption-regular min-w-7"
                    ></th>

                    {columns.map((column) => (
                      <th
                        key={column.label}
                        scope="col"
                        className="whitespace-nowrap p-2 text-left text-caption-regular"
                      >
                        <span className="flex items-center gap-1">
                          {column.label}
                          {column.sortable ? (
                            <ArrowDown className="size-4 cursor-pointer" />
                          ) : (
                            ''
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent bg-white">
                  {orders.map((order, index) => (
                    <tr
                      key={`${order.date}${index}`}
                      className={`${
                        order.all == 'Cancelled'
                          ? 'opacity-50 pointer-events-none'
                          : ''
                      }`}
                    >
                      <td className="eq-table-cell cursor-pointer">
                        <Plus />
                      </td>

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

                      <td className="eq-table-cell">{order.average || ''}</td>

                      <td className="eq-table-cell">{order.price || ''}</td>

                      <td className="eq-table-cell">{order.executed || ''}</td>

                      <td className="eq-table-cell">{order.amount || ''}</td>

                      <td className="eq-table-cell">{order.total || ''}</td>

                      <td className="eq-table-cell">
                        {order.trigger_conditions || ''}
                      </td>

                      <td className="eq-table-cell">{order.all || ''}</td>
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
