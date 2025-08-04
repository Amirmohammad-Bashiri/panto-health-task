"use client";

import { useEffect, useState } from "react";
import Chart from "@/components/Chart";

interface ChartData {
  title: string;
  data: [number, number | number[] | null][];
}

export default function Home() {
  const [chartsData, setChartsData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Revert the fetch path back to public/data.json
        const response = await fetch("./data.json");
        if (!response.ok) {
          throw new Error("Failed to load chart data");
        }
        const data = await response.json();
        setChartsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        D3.js Chart Visualization
      </h1>
      <div className="space-y-12">
        {chartsData.map((chartData, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <Chart data={chartData} />
          </div>
        ))}
      </div>
    </div>
  );
}
