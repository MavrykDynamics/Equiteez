import { ApexOptions } from "apexcharts";
import clsx from "clsx";
import ArrowUpIcon from "app/icons/arrow-up.svg?react";
import HomeIcon from "app/icons/home.svg?react";
import InfoIcon from "app/icons/info.svg?react";
import WalletIcon from "app/icons/wallet.svg?react";
import { FC, SVGProps, useEffect, useMemo, useState } from "react";
import OriginalApexCharts from "react-apexcharts";

import { Table } from "~/lib/atoms/Table/Table";
import { useClientLibData } from "~/lib/ui/use-client-lib";
import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { LoadableComponent } from "~/templates/CustomSuspense";

import styles from "./ROICalculator.module.css";

export type ROICalculatorData = {
  annualGrowth?: number;
  annualRentalYield?: number;
  initialInvestment?: number;
};

const DEFAULT_INVESTMENT = 48_000;
const DEFAULT_GROWTH = 6;
const DEFAULT_YIELD = 8;
const YEAR_OPTIONS = [
  { id: "1d", label: "1D", years: 1 },
  { id: "1y", label: "1Y", years: 1 },
  { id: "2y", label: "2Y", years: 2 },
  { id: "3y", label: "3Y", years: 3 },
] as const;

const SERIES_COLORS = ["#5157B1", "#648FDF", "#515BEF"];
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const ROICalculator: FC<{ data?: ROICalculatorData }> = ({ data }) => {
  const { IS_WEB } = useAppContext();
  const {
    clientModule: ChartModule,
    loading,
    setClientModule,
    setClientModuleError,
  } = useClientLibData<typeof OriginalApexCharts>();

  useEffect(() => {
    if (!IS_WEB) return;

    import("react-apexcharts")
      .then((module) => setClientModule(() => module.default))
      .catch((error) => {
        console.error("Error loading module:", error);
        setClientModuleError(error);
      });
  }, [IS_WEB, setClientModule, setClientModuleError]);

  const investmentMax = useMemo(
    () =>
      Math.max(
        100_000,
        roundUpToStep(
          getPositiveNumber(data?.initialInvestment, DEFAULT_INVESTMENT),
          1000
        )
      ),
    [data?.initialInvestment]
  );
  const growthMax = useMemo(
    () =>
      Math.max(
        8,
        roundUpToStep(
          getPositiveNumber(data?.annualGrowth, DEFAULT_GROWTH) + 2,
          1
        )
      ),
    [data?.annualGrowth]
  );
  const yieldMax = useMemo(
    () =>
      Math.max(
        8,
        roundUpToStep(
          getPositiveNumber(data?.annualRentalYield, DEFAULT_YIELD) + 2,
          1
        )
      ),
    [data?.annualRentalYield]
  );

  const [selectedPeriodId, setSelectedPeriodId] =
    useState<(typeof YEAR_OPTIONS)[number]["id"]>("3y");
  const [investment, setInvestment] = useState(() =>
    clampValue(
      getPositiveNumber(data?.initialInvestment, DEFAULT_INVESTMENT),
      1000,
      investmentMax
    )
  );
  const [growth, setGrowth] = useState(() =>
    clampValue(
      getPositiveNumber(data?.annualGrowth, DEFAULT_GROWTH),
      1,
      growthMax
    )
  );
  const [yieldRate, setYieldRate] = useState(() =>
    clampValue(
      getPositiveNumber(data?.annualRentalYield, DEFAULT_YIELD),
      1,
      yieldMax
    )
  );

  useEffect(() => {
    setInvestment((current) =>
      clampValue(
        getPositiveNumber(
          data?.initialInvestment,
          current || DEFAULT_INVESTMENT
        ),
        1000,
        investmentMax
      )
    );
  }, [data?.initialInvestment, investmentMax]);

  useEffect(() => {
    setGrowth((current) =>
      clampValue(
        getPositiveNumber(data?.annualGrowth, current || DEFAULT_GROWTH),
        1,
        growthMax
      )
    );
  }, [data?.annualGrowth, growthMax]);

  useEffect(() => {
    setYieldRate((current) =>
      clampValue(
        getPositiveNumber(data?.annualRentalYield, current || DEFAULT_YIELD),
        1,
        yieldMax
      )
    );
  }, [data?.annualRentalYield, yieldMax]);

  const selectedPeriod =
    YEAR_OPTIONS.find((option) => option.id === selectedPeriodId) ??
    YEAR_OPTIONS[3];

  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const categories = Array.from(
      { length: selectedPeriod.years },
      (_, index) => `${currentYear + index}`
    );

    const investmentSeries = categories.map(() => roundCurrency(investment));
    const growthSeries = categories.map((_, index) =>
      roundCurrency(investment * (Math.pow(1 + growth / 100, index + 1) - 1))
    );
    const yieldSeries = categories.map((_, index) =>
      roundCurrency(investment * (yieldRate / 100) * (index + 1))
    );

    const maxValue = Math.max(
      ...categories.map(
        (_, index) =>
          investmentSeries[index] + growthSeries[index] + yieldSeries[index]
      ),
      0
    );

    return {
      categories,
      maxValue,
      series: [
        { name: "Investment", data: investmentSeries },
        { name: "Growth", data: growthSeries },
        { name: "Yield", data: yieldSeries },
      ],
    };
  }, [growth, investment, selectedPeriod.years, yieldRate]);

  const chartOptions = useMemo<ApexOptions>(
    () => ({
      chart: {
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
        fontFamily: "Poppins, sans-serif",
      },
      colors: SERIES_COLORS,
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      grid: {
        borderColor: "#CCCCCC",
        strokeDashArray: 0,
        padding: {
          left: 12,
          right: 12,
          top: -8,
          bottom: 0,
        },
        xaxis: { lines: { show: false } },
      },
      legend: {
        fontSize: "12px",
        horizontalAlign: "right",
        markers: {
          fillColors: SERIES_COLORS,
          radius: 999,
          size: 10,
          strokeWidth: 0,
        },
        position: "top",
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          columnWidth: chartData.categories.length > 1 ? "52%" : "32%",
        },
      },
      stroke: {
        colors: ["transparent"],
        width: 0,
      },
      tooltip: {
        y: {
          formatter: (value) => formatCurrency(value),
        },
      },
      xaxis: {
        axisBorder: { color: "#CCCCCC" },
        axisTicks: { show: false },
        categories: chartData.categories,
        labels: {
          style: {
            colors: chartData.categories.map(() => "#4C4B49"),
            fontSize: "14px",
          },
        },
      },
      yaxis: {
        forceNiceScale: true,
        labels: {
          formatter: (value) => formatAxisValue(value),
          style: {
            colors: ["#4C4B49"],
            fontSize: "14px",
          },
        },
        max: getChartMax(chartData.maxValue),
        min: 0,
        tickAmount: 4,
      },
    }),
    [chartData.categories, chartData.maxValue]
  );

  const chartModuleProps = useMemo(
    () => ({
      height: 320,
      options: chartOptions,
      series: chartData.series,
      type: "bar" as const,
    }),
    [chartData.series, chartOptions]
  );

  return (
    <Table className="bg-white overflow-hidden !p-0">
      <div className="bg-dark-green-400 px-6 py-4 lg:px-7">
        <h3 className="text-card-headline text-white">ROI Calculator</h3>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 lg:grid lg:grid-cols-[261px_minmax(0,1fr)] lg:gap-4 lg:px-7 lg:py-7">
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="mb-6 text-card-headline text-sand-900">
              Investment Parameters
            </h4>

            <div className="flex rounded-lg bg-gray-50 p-[2px]">
              {YEAR_OPTIONS.map((option) => {
                const isActive = option.id === selectedPeriodId;

                return (
                  <button
                    key={option.id}
                    className={clsx(
                      "flex-1 rounded-lg px-3 py-2 text-caption transition-colors",
                      isActive
                        ? "bg-sand-800 text-white"
                        : "text-sand-700 hover:bg-sand-100"
                    )}
                    onClick={() => setSelectedPeriodId(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <SliderControl
              formatLabel={formatCurrency}
              label="Initial Investment"
              max={investmentMax}
              min={1000}
              onChange={setInvestment}
              step={1000}
              value={investment}
            />
            <SliderControl
              formatLabel={formatPercent}
              label="Annual Growth"
              max={growthMax}
              min={1}
              onChange={setGrowth}
              step={0.1}
              value={growth}
            />
            <SliderControl
              formatLabel={formatPercent}
              label="Annual Rental Yield"
              max={yieldMax}
              min={1}
              onChange={setYieldRate}
              step={0.1}
              value={yieldRate}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-sand-100 lg:border-l lg:pl-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <MetricCard
              Icon={HomeIcon}
              label="Investment"
              value={formatCurrency(investment)}
            />
            <MetricCard
              Icon={WalletIcon}
              label="Dividend Yield"
              value={formatPercent(yieldRate)}
            />
            <MetricCard
              Icon={ArrowUpIcon}
              label="Growth Rate"
              value={formatPercent(growth)}
            />
          </div>

          <div className={clsx(styles.chart, "rounded-xl bg-gray-50 p-4")}>
            <LoadableComponent
              Component={ChartModule}
              componentProps={chartModuleProps}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Table>
  );
};

const MetricCard: FC<{
  Icon: FC<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}> = ({ Icon, label, value }) => {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1 text-caption-regular text-sand-900">
        <Icon className="h-4 w-4 text-blue-300" />
        <span>{label}</span>
        <InfoIcon className="h-4 w-4 text-sand-900" />
      </div>
      <p className="text-body font-bold text-sand-900">{value}</p>
    </div>
  );
};

const SliderControl: FC<{
  formatLabel: (value: number) => string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}> = ({ formatLabel, label, max, min, onChange, step, value }) => {
  const progress = getSliderProgress(value, min, max);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-body-xs font-semibold text-sand-900">{label}</p>
        <div className="rounded-lg bg-gray-50 px-3 py-1 text-body-xs font-semibold text-sand-900">
          {formatLabel(value)}
        </div>
      </div>

      <input
        className={styles.rangeInput}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{
          background: `linear-gradient(to right, #ff8a3d 0%, #ff8a3d ${progress}%, #e3e1dd ${progress}%, #e3e1dd 100%)`,
        }}
        type="range"
        value={value}
      />

      <div className="flex items-center justify-between text-caption-regular text-sand-900">
        <span>{formatSliderBound(min, label)}</span>
        <span>{formatSliderBound(max, label)}</span>
      </div>
    </div>
  );
};

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatAxisValue(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return `${Math.round(value)}`;
}

function formatCurrency(value: number) {
  return `$${moneyFormatter.format(roundCurrency(value))}`;
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function formatSliderBound(value: number, label: string) {
  return label === "Initial Investment"
    ? moneyFormatter.format(value)
    : formatAxisValue(value);
}

function getChartMax(value: number) {
  if (!value) return 100_000;

  const step = value >= 100_000 ? 10_000 : 5_000;

  return roundUpToStep(value * 1.1, step);
}

function getPositiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function getSliderProgress(value: number, min: number, max: number) {
  if (max <= min) return 0;

  return ((value - min) / (max - min)) * 100;
}

function roundCurrency(value: number) {
  return Math.round(value);
}

function roundUpToStep(value: number, step: number) {
  return Math.ceil(value / step) * step;
}
