import { ApexOptions } from "apexcharts";
import { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import OriginalApexCharts from "react-apexcharts";

import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
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

const SERIES_COLORS = [
  "var(--r-color-accent-green-600)",
  "var(--r-color-green-500)",
  "var(--r-color-orange-500)",
];
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

// TODO remove mock data. Need real ROICalculatorData
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
        fontFamily: "var(--r-font-body)",
      },
      colors: SERIES_COLORS,
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      grid: {
        borderColor: "var(--r-color-neutral-100)",
        strokeDashArray: 0,
        padding: {
          left: 0,
          right: 0,
          top: -8,
          bottom: 0,
        },
        xaxis: { lines: { show: false } },
      },
      legend: {
        fontSize: "14px",
        horizontalAlign: "left",
        markers: {
          fillColors: SERIES_COLORS,
          radius: 9999,
          size: 8,
          strokeWidth: 0,
        },
        position: "top",
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          columnWidth: chartData.categories.length > 1 ? "46%" : "28%",
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
        axisBorder: { color: "var(--r-color-neutral-100)" },
        axisTicks: { show: false },
        categories: chartData.categories,
        labels: {
          style: {
            colors: chartData.categories.map(
              () => "var(--r-color-neutral-500)"
            ),
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        forceNiceScale: true,
        labels: {
          formatter: (value) => formatAxisValue(value),
          style: {
            colors: ["var(--r-color-neutral-500)"],
            fontSize: "12px",
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
      height: 270,
      options: chartOptions,
      series: chartData.series,
      type: "bar" as const,
    }),
    [chartData.series, chartOptions]
  );
  const selectedYearIndex = selectedPeriod.years - 1;
  const totalReturn =
    chartData.series[1].data[selectedYearIndex] +
    chartData.series[2].data[selectedYearIndex];
  const yieldPercentage = investment ? (totalReturn / investment) * 100 : 0;
  const monthlyIncome =
    chartData.series[2].data[selectedYearIndex] / (selectedPeriod.years * 12);

  const metricCards = [
    {
      label: "Total Return",
      value: formatCompactCurrency(totalReturn),
    },
    {
      label: "Yield",
      value: `+${formatPercent(yieldPercentage)}`,
      tone: "positive",
    },
    {
      label: "Monthly",
      value: formatCurrency(monthlyIncome),
    },
  ] satisfies ReadonlyArray<{
    label: string;
    tone?: "positive";
    value: string;
  }>;

  return (
    <section aria-label="ROI calculator" className={styles.calculator}>
      <div className={styles.parameters}>
        <RHeading size="h7" weight="medium">
          Investment Parameters
        </RHeading>

        <div className={styles.periodControl}>
          <RText size="body-sm">Time Period</RText>
          <div className={styles.periods}>
            {YEAR_OPTIONS.map((option) => {
              const isActive = option.id === selectedPeriodId;

              return (
                <button
                  key={option.id}
                  className={isActive ? styles.periodActive : styles.period}
                  onClick={() => setSelectedPeriodId(option.id)}
                  type="button"
                >
                  <RText
                    color={isActive ? "neutral-white" : "neutral-900"}
                    size="body-s"
                  >
                    {option.label}
                  </RText>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.controls}>
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

      <div className={styles.results}>
        <div className={styles.metricCards}>
          {metricCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              tone={card.tone}
              value={card.value}
            />
          ))}
        </div>
        <div className={styles.chart}>
          <LoadableComponent
            Component={ChartModule}
            componentProps={chartModuleProps}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

const MetricCard: FC<{
  label: string;
  tone?: "positive";
  value: string;
}> = ({ label, tone, value }) => {
  return (
    <div className={styles.metricCard}>
      <RText color="neutral-600" size="body-s">
        {label}
      </RText>
      <RText
        color={tone === "positive" ? "green-600" : "neutral-black"}
        size="body-l"
        weight="medium"
      >
        {value}
      </RText>
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
  const sliderStyle = { "--slider-progress": `${progress}%` } as CSSProperties;

  return (
    <div className={styles.sliderControl}>
      <div className={styles.sliderHeader}>
        <RText size="body-sm">{label}</RText>
        <output className={styles.sliderValue}>{formatLabel(value)}</output>
      </div>

      <input
        className={styles.rangeInput}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={sliderStyle}
        type="range"
        value={value}
      />

      <div className={styles.sliderBounds}>
        <RText color="neutral-900" size="body-s">
          {formatSliderBound(min, label)}
        </RText>
        <RText color="neutral-900" size="body-s">
          {formatSliderBound(max, label)}
        </RText>
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

function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }

  return formatCurrency(value);
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
