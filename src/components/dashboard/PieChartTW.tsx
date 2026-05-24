"use client";

import DonutChart from "./DonutChart";

interface Props {
  holdings: { ticker: string; stockName: string; valueTwd: number }[];
}

export default function PieChartTW({ holdings }: Props) {
  return (
    <DonutChart
      title="台股持股分布"
      holdings={holdings}
      nameFormat={(ticker, stockName) => `${ticker} ${stockName}`}
    />
  );
}
