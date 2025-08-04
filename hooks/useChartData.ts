import { useEffect, useState } from "react";

interface ChartData {
  title: string;
  data: [number, number | number[] | null][];
}

export default function useChartData() {
  const [chartsData, setChartsData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data.json");
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

  return { chartsData, loading, error };
}
