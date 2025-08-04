"use client";

import { useRef, useState } from "react";

import SingleChart from "./SingleChart";
import MultiChart from "./MultiChart";

interface ChartProps {
  data: {
    title: string;
    data: [number, number | number[] | null][];
  };
}

type ChartType = "single" | "multi";

interface DataPoint {
  x: number;
  y: number;
}

export default function Chart({ data }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<ChartType>("single");
  const [visibleSeries, setVisibleSeries] = useState<boolean[]>([
    true,
    true,
    true,
  ]);

  // Detect chart type based on data format
  function detectChartType(
    chartData: [number, number | number[] | null][]
  ): ChartType {
    for (const [, value] of chartData) {
      if (value !== null) {
        return Array.isArray(value) ? "multi" : "single";
      }
    }
    return "single";
  }

  // Processed data for single-series chart
  const processedSingleSeriesData = data.data
    .filter(
      (entry: [number, number | number[] | null]) =>
        entry[1] !== null && typeof entry[1] === "number"
    )
    .map((entry: [number, number | number[] | null]) => {
      const [timestamp, value] = entry;
      return { x: timestamp, y: value as number };
    });

  // Processed data for multi-series chart
  const series1: DataPoint[] = [];
  const series2: DataPoint[] = [];
  const series3: DataPoint[] = [];
  data.data.forEach((entry: [number, number | number[] | null]) => {
    const [timestamp, values] = entry;
    if (Array.isArray(values) && values.length >= 3) {
      if (values[0] !== null) series1.push({ x: timestamp, y: values[0] });
      if (values[1] !== null) series2.push({ x: timestamp, y: values[1] });
      if (values[2] !== null) series3.push({ x: timestamp, y: values[2] });
    }
  });
  const processedMultiSeriesData = [series1, series2, series3] as [
    DataPoint[],
    DataPoint[],
    DataPoint[]
  ];

  // Handler for toggling series visibility
  function handleSeriesToggle(index: number) {
    setVisibleSeries(prev => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  }

  // Set chart type on data change
  // (runs on every render, but is cheap)
  if (chartType !== detectChartType(data.data)) {
    setChartType(detectChartType(data.data));
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">{data.title}</h2>
      {chartType === "multi" && (
        <div className="flex justify-center gap-4 mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600"
              checked={visibleSeries[0]}
              onChange={() => handleSeriesToggle(0)}
            />
            <span className="ml-2 text-sm text-blue-600">Series 1 (Blue)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600"
              checked={visibleSeries[1]}
              onChange={() => handleSeriesToggle(1)}
            />
            <span className="ml-2 text-sm text-green-600">
              Series 2 (Green)
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-red-600"
              checked={visibleSeries[2]}
              onChange={() => handleSeriesToggle(2)}
            />
            <span className="ml-2 text-sm text-red-600">Series 3 (Red)</span>
          </label>
        </div>
      )}
      <div className="flex justify-center">
        <div className="w-full max-w-[800px] overflow-x-auto border border-gray-200 rounded">
          <svg ref={svgRef} className="block" />
          {chartType === "single" && (
            <SingleChart data={processedSingleSeriesData} svgRef={svgRef} />
          )}
          {chartType === "multi" && (
            <MultiChart
              seriesData={
                processedMultiSeriesData as [
                  DataPoint[],
                  DataPoint[],
                  DataPoint[]
                ]
              }
              visibleSeries={visibleSeries}
              svgRef={svgRef}
              tooltipRef={tooltipRef}
              data={data.data as [number, number[] | null][]}
              onSeriesToggle={handleSeriesToggle}
            />
          )}
        </div>
        <div
          ref={tooltipRef}
          className="absolute bg-white p-2 rounded shadow-md text-sm pointer-events-none opacity-0 transition-opacity duration-200 z-10"
          style={{ minWidth: "120px" }}></div>
      </div>
      <div className="mt-2 text-sm text-gray-600 text-center">
        Chart Type: {chartType === "single" ? "Single Series" : "Multi Series"}
      </div>
    </div>
  );
}
