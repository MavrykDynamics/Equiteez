import { FC, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import chart from '~/mocks/chart';
import { ApexOptions } from 'apexcharts'
import Expand from '~/icons/expand.svg?react';
import Settings from '~/icons/star.svg?react';

export const ChartTab = () => {
  
  const [ChartModule, setClientComponent] = useState<any>(null);

  // Only load charts on clinet side
  useEffect(() => {
    import('react-apexcharts')
      .then((module) => setClientComponent(() => module.default))
      .catch((error) => {
        console.error('Error loading component:', error);
      });
  }, []);

  if (!ChartModule) {
    return <div>Loading...</div>; // Render this on the server side
  }

  const mockChart = chart();

  const opts : ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 400,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false
      }
    },
    title: {
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      opposite: true,
      labels: {
        formatter: function(value) {
          return value.toFixed(4);
        }
      }
    }
  };

  const state = {
    series: [{
      data: mockChart
    }],
    options: opts
  };

  return (
    <div>
      <div className="w-full flex justify-between">
        <div className="flex gap-4">
          <span className="text-body">1H</span>
          <span className="text-body text-green-main">1D</span>
          <span className="text-body">1W</span>
          <span className="text-body">1M</span>
          <span className="text-body">1Y</span>
          <span className="text-body">3Y</span>
        </div>

        <div className="flex gap-2">
          <Settings className="size-6" />
          <Expand className="size-6" />
        </div>
      </div>
      <div id="chart">
        <ChartModule options={state.options} series={state.series} type="candlestick" height={350} />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};