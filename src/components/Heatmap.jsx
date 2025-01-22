import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Heatmap = () => {
  const container = useRef();

  const createChart = (data) => {
    d3.select(container.current).selectAll("*").remove();

    console.log(data.monthlyVariance);

    d3.select(container.current)
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .text("Monthly Global Land-Surface Temperature");

    const dataReady = data.monthlyVariance.map((d) => ({
      ...d,
      temp: Math.round((data.baseTemperature + d.variance) * 100) / 100,
      month: d.month - 1,
    }));

    const minX = d3.min(dataReady, (d) => d.year);
    const maxX = d3.max(dataReady, (d) => d.year);

    d3.select(container.current)
      .append("h2")
      .attr("class", "subtitle")
      .attr("id", "description")
      .text(
        minX +
          " - " +
          maxX +
          ": base temperature " +
          data.baseTemperature +
          "°C"
      );

    const w = (dataReady.length / 2) * 1.05;
    const h = 550;
    const margin = { top: 40, right: 40, bottom: 80, left: 70 };

    const chart = d3
      .select(container.current)
      .append("div")
      .attr("class", "chart");

    const svg = chart.append("svg").attr("width", w).attr("height", h);

    const xDomain = Array.from(new Set(dataReady.map((d) => d.year))).sort(
      (a, b) => a - b
    );

    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([margin.left, w - margin.right]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xDomain.filter((d) => d % 10 === 0));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + (h - margin.bottom) + ")")
      .call(xAxis);

    const yDomain = Array.from(new Set(dataReady.map((d) => d.month))).sort(
      (a, b) => b - a
    );

    console.log(yDomain);

    const yScale = d3
      .scaleBand()
      .domain(yDomain)
      .range([h - margin.bottom, margin.top]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => months[d]);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(yAxis);

    const colorsDomain = [
      d3.max(dataReady, (d) => d.temp),
      d3.min(dataReady, (d) => d.temp),
    ];

    const colors = d3
      .scaleSequential()
      .domain(colorsDomain)
      .interpolator(d3.interpolateRdYlBu);

    const tooltip = chart
      .append("div")
      .attr("id", "tooltip")
      .style("display", "none")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid 1px black")
      .style("color", "black")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "14px");

    const showTooltip = (event, d) => {
      const yearMonth =
        "<p style='margin:0;font-weight:600;text-transform:uppercase;'>" +
        months[d.month] +
        " " +
        d.year +
        "</p>";

      const temp = "<p style='margin:0;'>" + d.temp + " °C</p>";

      const variance =
        "<p style='margin:0;'>" +
        (d.variance > 0 ? "+" : "") +
        Math.round(d.variance * 100) / 100 +
        " °C</p>";

      const html = "<div>" + yearMonth + temp + variance + "</div>";

      tooltip
        .attr("data-year", d.year)
        .style("display", "block")
        .style("opacity", 0.9)
        .style("text-align", "center")
        .html(html)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    };

    const hideTooltip = () => {
      tooltip.style("display", "none").style("opacity", 0);
    };

    svg
      .append("g")
      .attr("class", "map")
      .attr("id", "map")
      .selectAll("rect")
      .data(dataReady)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colors(d.temp))
      .attr("class", "cell")
      .attr("data-month", (d) => d.month)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.temp)
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", (d) => `translate(${margin.left},0)`);

    const legendElementWidth = 40;
    const legendHeight = 20;

    const legendBins = [...Array(11).keys()].map(
      (x) => Math.round(d3.quantile(colorsDomain, x * 0.1) * 100) / 100
    );

    legend
      .selectAll("rect")
      .data(legendBins)
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendElementWidth * i)
      .attr("y", h - 2 * legendHeight)
      .attr("width", legendElementWidth)
      .attr("height", legendHeight)
      .style("fill", (d) => colors(d));

    legend
      .selectAll("text")
      .data(legendBins)
      .enter()
      .append("text")
      .text((d) => "≥ " + d)
      .attr("x", (d, i) => legendElementWidth * i)
      .attr("y", h - legendHeight / 2)
      .style("font-size", "9px")
      .style("fill", "#aaa");
  };

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    )
      .then((response) => response.json())
      .then((data) => {
        createChart(data);
      });
  }, []);

  return (
    <div className="root">
      <div ref={container} className="container" />
    </div>
  );
};

export default Heatmap;
