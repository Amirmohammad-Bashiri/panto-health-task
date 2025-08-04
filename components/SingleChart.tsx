import { useEffect } from "react";
import * as d3 from "d3";

interface SingleChartProps {
  data: { x: number; y: number }[];
  svgRef: React.RefObject<SVGSVGElement>;
}

const SingleChart: React.FC<SingleChartProps> = ({ data, svgRef }) => {
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const containerHeight = 400;
    const chartHeight = containerHeight - margin.top - margin.bottom;
    const chartContentWidth = Math.max(800, data.length * 0.1);
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([0, chartContentWidth]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .nice()
      .range([chartHeight, 0]);
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
      .line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("d", line);
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "#2563eb");
  }, [data, svgRef]);
  return null;
};

export default SingleChart;
