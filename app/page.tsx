"use client";

import Chart from "@/components/Chart";
import useChartData from "@/hooks/useChartData";

interface ChartData {
  title: string;
  data: [number, number | number[] | null][];
}

export default function Home() {
  const { chartsData, loading, error } = useChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error as string}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        D3.js Chart Visualization
      </h1>
      <div className="space-y-12">
        {chartsData.map((chartData: ChartData, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <Chart data={chartData} />
          </div>
        ))}
      </div>
    </div>
  );
}
