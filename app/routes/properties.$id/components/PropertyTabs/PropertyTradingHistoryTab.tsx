import { Table } from '~/lib/atoms/Table/Table';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';

// icons
import ExpandIcon from 'app/icons/expand.svg?react';
import SettingsIcon from 'app/icons/settings.svg?react';
import { useEffect, useMemo } from 'react';
import { ApexOptions } from 'apexcharts';

import { LoadableComponent } from '~/templates/CustomSuspense';
import { useClientLibData } from '~/hooks/use-client-lib';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

import OriginalApexCharts from 'react-apexcharts';
import clsx from 'clsx';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { formatChartData } from '~/lib/utils/chart';

export const PropertyTradingHistoryTab = () => {
  const { IS_WEB } = useAppContext();
  const { activeEstate } = useEstatesContext();

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
          data: formatChartData(
            // TODO change trading history
            (activeEstate as SecondaryEstate)?.assetDetails?.tradingHistory ??
              []
          ),
        },
      ],
      options: opts,
    }),
    [activeEstate, opts]
  );

  const chartModuleProps = useMemo(
    () => ({
      options: state.options,
      series: state.series,
      type: 'candlestick',
      height: 565,
    }),
    [state.options, state.series]
  );

  return (
    <Table>
      <div className="flex items-center justify-between">
        <CustomDropdown>
          <ClickableDropdownArea>
            <DropdownFaceContent className="py-[10px] px-3 border border-divider rounded-lg">
              <div className="text-body text-content">1D</div>
            </DropdownFaceContent>
          </ClickableDropdownArea>
          <DropdownBodyContent topMargin={6}>
            <div className="text-body text-content py-[10px] px-3 hover:bg-gray-100">
              1W
            </div>
            <div className="text-body text-content py-[10px] px-3 hover:bg-gray-100">
              1M
            </div>
            <div className="text-body text-content py-[10px] px-3 hover:bg-gray-100">
              1Y
            </div>
          </DropdownBodyContent>
        </CustomDropdown>

        <div className="flex items-center gap-x-1">
          <SettingsIcon className="w-6 h-6 cursor-pointer" />
          <ExpandIcon className="w-6 h-6 text-content stroke-current cursor-pointer" />
        </div>
      </div>
      <div className="my-4 flex items-center gap-x-[6px] text-body-xs text-content">
        <span>FA</span>
        <Dot />
        <span>1D</span>
        <Dot />
        <p>
          <span>O</span>
          <span className="text-error">&nbsp;0.051570</span>
        </p>
        <p>
          <span>H</span>
          <span className="text-error">&nbsp;0.052060</span>
        </p>
        <p>
          <span>L</span>
          <span className="text-error">&nbsp;0.050660</span>
        </p>
        <p>
          <span>C</span>
          <span className="text-error">&nbsp;0.050870 -0.000710 (-1.38%)</span>
        </p>
      </div>

      <div
        className={clsx(
          loading && 'flex items-center justify-center h-[565px]'
        )}
      >
        <LoadableComponent
          loading={loading}
          Component={ChartModule}
          componentProps={chartModuleProps}
        />
      </div>
    </Table>
  );
};

const Dot = () => {
  return <div className="bg-divider rounded-full w-1 h-1" />;
};
