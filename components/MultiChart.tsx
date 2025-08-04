import React from "react";
import * as d3 from "d3";

interface DataPoint {
  x: number;
  y: number;
}

interface MultiChartProps {
  seriesData: [DataPoint[], DataPoint[], DataPoint[]];
  visibleSeries: boolean[];
  svgRef: React.RefObject<SVGSVGElement>;
  tooltipRef: React.RefObject<HTMLDivElement>;
  data: [number, number[] | null][];
  onSeriesToggle: (index: number) => void;
}

const colors = ["#2563eb", "#16a34a", "#dc2626"];
const seriesNames = ["Series 1", "Series 2", "Series 3"];

const MultiChart: React.FC<MultiChartProps> = ({
  seriesData,
  visibleSeries,
  svgRef,
  tooltipRef,
  data,
  onSeriesToggle,
}) => {
  React.useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const containerHeight = 400;
    const chartHeight = containerHeight - margin.top - margin.bottom;
    const chartContentWidth = Math.max(800, data.length * 0.1);
    // Only consider visible series for scaling the Y-axis
    const allVisibleSeriesPoints = [
      visibleSeries[0] ? seriesData[0] : [],
      visibleSeries[1] ? seriesData[1] : [],
      visibleSeries[2] ? seriesData[2] : [],
    ].flat();
    let yScale: d3.ScaleLinear<number, number>;
    if (allVisibleSeriesPoints.length === 0) {
      yScale = d3.scaleLinear().domain([0, 100]).nice().range([chartHeight, 0]);
    } else {
      yScale = d3
        .scaleLinear()
        .domain(d3.extent(allVisibleSeriesPoints, d => d.y) as [number, number])
        .nice()
        .range([chartHeight, 0]);
    }
    const allPointsForScaling = allVisibleSeriesPoints.length
      ? allVisibleSeriesPoints
      : [...seriesData[0], ...seriesData[1], ...seriesData[2]];
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(allPointsForScaling, d => d.x) as [number, number])
      .range([0, chartContentWidth]);
    svg
      .attr("width", chartContentWidth + margin.left + margin.right)
      .attr("height", containerHeight);
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));
    g.append("g")
      .attr("class", "x-grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    g.append("g")
      .attr("class", "y-grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-chartContentWidth)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    const line = d3
      .line<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    seriesData.forEach((series, index) => {
      if (series.length === 0 || !visibleSeries[index]) return;
      g.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", colors[index])
        .attr("stroke-width", 2)
        .attr("d", line);
    });
    // Legend
    const legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${chartContentWidth - 150}, 20)`);
    const legendBackground = legend
      .append("rect")
      .attr("x", -5)
      .attr("y", -5)
      .attr("rx", 5)
      .attr("ry", 5)
      .style("fill", "rgba(255, 255, 255, 0.8)")
      .style("stroke", "#ccc")
      .style("stroke-width", 1);
    let maxTextWidth = 0;
    seriesNames.forEach((item, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 25})`);
      legendRow
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colors[index]);
      const textElement = legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text(item);
      const bbox = textElement.node()?.getBBox();
      if (bbox) {
        maxTextWidth = Math.max(maxTextWidth, bbox.width);
      }
    });
    legendBackground
      .attr("width", maxTextWidth + 40)
      .attr("height", seriesNames.length * 25 + 10);
    // Tooltip overlay
    g.append("rect")
      .attr("class", "overlay")
      .attr("width", chartContentWidth)
      .attr("height", chartHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const invertedX = xScale.invert(mx);
        const bisect = d3.bisector((d: [number, any]) => d[0]).left;
        const index = bisect(data, invertedX, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const closestDataPoint =
          d1 && invertedX - d0[0] > d1[0] - invertedX ? d1 : d0;
        if (closestDataPoint && tooltipRef.current) {
          const [timestamp, values] = closestDataPoint;
          const tooltipDiv = d3.select(tooltipRef.current);
          let tooltipContent = `<strong>Time:</strong> ${timestamp}<br/>`;
          if (Array.isArray(values)) {
            seriesNames.forEach((name, i) => {
              tooltipContent += `<span style="color:${
                colors[i]
              }">${name}:</span> ${
                values[i] !== null ? values[i].toFixed(2) : "N/A"
              }<br/>`;
            });
          }
          tooltipDiv
            .html(tooltipContent)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .style("opacity", 1);
        }
      })
      .on("mouseleave", () => {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style("opacity", 0);
        }
      });
  }, [seriesData, visibleSeries, svgRef, tooltipRef, data]);
  return null;
};

export default MultiChart;
