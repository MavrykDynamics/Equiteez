import { useEffect, useMemo } from "react";
import { useClientLibData } from "~/lib/ui/use-client-lib";
import { useAppContext } from "~/providers/AppProvider/AppProvider";

import OriginalApexCharts from "react-apexcharts";
import { LoadableComponent } from "~/templates/CustomSuspense";
import { Text } from "~/lib/atoms/Typography/Text";
import { AssetType } from "~/providers/UserAssets/userAssets.types";

export const WalletPieChart = ({ userAssets }: { userAssets: AssetType[] }) => {
  const { IS_WEB } = useAppContext();

  const {
    clientModule: ChartModule,
    loading,
    setClientModule,
    setClientModuleError,
  } = useClientLibData<typeof OriginalApexCharts>();

  useEffect(() => {
    if (IS_WEB) {
      import("react-apexcharts")
        .then((module) => setClientModule(() => module.default))
        .catch((error) => {
          console.error("Error loading module:", error);
          setClientModuleError(error);
        });
    }
  }, [setClientModuleError, setClientModule, IS_WEB]);

  const hasData = userAssets.some((item) => item.available_balance_usd > 0);

  const labels = useMemo(
    () => (hasData ? userAssets.map((item) => item.token.name) : [""]),
    [userAssets, hasData]
  );

  const series = useMemo(
    () =>
      hasData ? userAssets.map((item) => item.available_balance_usd) : [100],
    [userAssets, hasData]
  );

  const colors = useMemo(
    () =>
      hasData
        ? ["#252D9E", "#3B42A8", "#5157B1", "#666CBB", "#5157B1", "#666CBB"]
        : ["#B0AFAC"],
    [hasData]
  );

  const opts = useMemo(
    () => ({
      chart: {
        type: "donut",
        sparkline: {
          enabled: true,
        },
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        events: {
          dataPointSelection: () => {},
        },
      },
      states: {
        active: {
          filter: {
            type: "none",
          },
        },
      },
      colors,
      labels,
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: hasData,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: {
          fontSize: "10px",
          fontWeight: "bold",
          colors: ["#fff"],
        },
      },
      tooltip: {
        enabled: hasData,
        fillSeriesColor: false,
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const label = w.globals.labels[seriesIndex];
          const percent = w.globals.seriesPercent[seriesIndex][0]?.toFixed(1);

          return `<div style="
                      padding: 8px;
                      background: #E6E6E6;
                      color: #191918;
                      font-size: 12px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                  ">
                    <span style="font-weight: 600; 
                                 font-size: 12px;
                    ">${percent}%</span>
                    <span style="font-weight: 400; 
                                 font-size: 10px; 
                                 overflow:hidden;
                                 display: block; 
                                 max-width: 88px; 
                                 text-overflow:ellipsis;
                                 white-space:nowrap
                    ">${label}</span>
                  </div>`;
        },
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "65%",
            labels: {
              show: false,
            },
          },
        },
      },
    }),
    [colors, hasData, labels]
  );

  const chartModuleProps = useMemo(
    () => ({
      options: opts,
      series,
      type: "donut",
      height: 216,
      width: 216,
    }),
    [opts, series]
  );

  return (
    <div className="flex items-center relative justify-center min-w-[216px]">
      <LoadableComponent
        loading={loading}
        Component={ChartModule}
        componentProps={chartModuleProps}
      />
      {!hasData && (
        <Text className="absolute" size="smallBody" weight="bold">
          0%
        </Text>
      )}
    </div>
  );
};
