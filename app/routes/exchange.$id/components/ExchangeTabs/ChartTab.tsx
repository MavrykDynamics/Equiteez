import { FC, useEffect, useMemo } from 'react';
import chart from '~/mocks/chart';
import { ApexOptions } from 'apexcharts';
import Expand from '~/icons/expand.svg?react';
import Settings from '~/icons/settings.svg?react';

import { LoadableComponent } from '~/templates/CustomSuspense';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { useClientLibData } from '~/hooks/use-client-lib';

import OriginalApexCharts from 'react-apexcharts';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';

export const ChartTab: FC<{ estate: SecondaryEstate }> = () => {
  const { IS_WEB } = useAppContext();
  const {
    clientModule: ChartModule,
    loading,
    setClientModule,
    setClientModuleError,
  } = useClientLibData<typeof OriginalApexCharts>();

  useEffect(() => {
    if (IS_WEB) {
      import('react-apexcharts')
        .then((module) => setClientModule(() => module.default))
        .catch((error) => {
          console.error('Error loading module:', error);
          setClientModuleError(error);
        });
    }
  }, [setClientModuleError, setClientModule, IS_WEB]);
  const mockChart = chart();

  const opts: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'candlestick',
        height: 400,
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      title: {
        align: 'left',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
        opposite: true,
        labels: {
          formatter: function (value) {
            return value.toFixed(4);
          },
        },
      },
    }),
    []
  );

  const state = useMemo(
    () => ({
      series: [
        {
          data: mockChart,
        },
      ],
      options: opts,
    }),
    [mockChart, opts]
  );

  const chartModuleProps = useMemo(
    () => ({
      options: state.options,
      series: state.series,
      type: 'candlestick',
      height: 500,
      width: 746,
    }),
    [state.options, state.series]
  );

  return (
    <div className="overflow-hidden flex flex-col">
      <div className="w-full flex justify-between items-center overflow-x-hidden">
        <div className="flex gap-x-3 text-caption-regular -mt-1">
          <span className="min-w-[21px] flex justify-center">1H</span>
          <span className=" text-green-main min-w-[21px] flex justify-center">
            1D
          </span>
          <span className="min-w-[21px] flex justify-center">1W</span>
          <span className="min-w-[21px] flex justify-center">1M</span>
          <span className="min-w-[21px] flex justify-center">1Y</span>
          <span className="min-w-[21px] flex justify-center">3Y</span>
        </div>

        <div className="flex gap-2">
          <Settings className="size-6" />
          <Expand className="size-6" />
        </div>
      </div>
      <div id="chart">
        <LoadableComponent
          loading={loading}
          Component={ChartModule}
          componentProps={chartModuleProps}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};
