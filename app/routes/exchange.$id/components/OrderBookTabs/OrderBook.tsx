import orderbook from '~/mocks/orderbook.json';
import RedArrowDown from '~/icons/red-arrow-down.svg?react';

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
          <table className="min-w-full divide-y divide-divider">
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

                  <td className="eq-table-cell-small">{order.amount || ''}</td>

                  <td className="eq-table-cell-small">{order.total || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
