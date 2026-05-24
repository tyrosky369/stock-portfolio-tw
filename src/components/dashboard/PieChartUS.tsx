"use client";

import DonutChart from "./DonutChart";

interface Props {
  holdings: { ticker: string; stockName: string; valueTwd: number }[];
}

export default function PieChartUS({ holdings }: Props) {
  return (
    <DonutChart
      title="美股持股分布"
      holdings={holdings}
      nameFormat={(ticker) => ticker}
    />
  );
}
