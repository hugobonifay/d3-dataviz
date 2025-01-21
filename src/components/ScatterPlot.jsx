import { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = () => {
  const container = useRef();

  const createChart = (data) => {
    d3.select(container.current).selectAll("*").remove();

    d3.select(container.current)
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .text("Doping in Professional Bicycle Racing");

    d3.select(container.current)
      .append("h2")
      .attr("class", "subtitle")
      .attr("id", "subtitle")
      .text("35 Fastest times up Alpe d'Huez");

    const w = 875;
    const h = 450;
    const margin = { top: 40, right: 40, bottom: 40, left: 70 };

    const chart = d3
      .select(container.current)
      .append("div")
      .attr("class", "chart");

    const svg = chart.append("svg").attr("width", w).attr("height", h);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", 25)
      .text("Time in minutes");

    const xMin = d3.min(data, (d) => d.Year);
    const xMax = d3.max(data, (d) => d.Year);

    const xDomain = [new Date(xMin, 0, 1), new Date(xMax, 0, 1)];

    const xScale = d3
      .scaleTime()
      .domain(xDomain)
      .range([margin.left, w - margin.right]);

    const xAxis = d3.axisBottom(xScale);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + (h - margin.bottom) + ")")
      .call(xAxis);

    const yDomain = [
      d3.max(data, (d) => d.Seconds),
      d3.min(data, (d) => d.Seconds),
    ];

    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([h - margin.bottom, margin.top]);

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      return d3.timeFormat("%M:%S")(new Date(d * 1000));
    });

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(yAxis);

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
      const color = d.Doping ? "red" : "green";

      const name =
        "<p style='text-transform:uppercase;margin:0;font-weight:600;color:" +
        color +
        "'>" +
        d.Name +
        " (" +
        d.Nationality +
        ")" +
        "</p>";

      const year = "<p style='margin:0;'><b>Year:</b> " + d.Year + "</p>";

      const time = "<p style='margin:0;'><b>Time:</b> " + d.Time + "</p>";

      const doping = d.Doping
        ? "<p style='margin:0;color:red;'><b style='color:black;'>Doping allegations:</b> " +
          d.Doping +
          "</p>"
        : "<p style='margin:0;'><b>No doping allegations</b></p>";

      const html = "<div>" + name + year + time + doping + "</div>";

      tooltip
        .attr("data-year", d.Year)
        .style("border", "solid 1px " + color)
        .style("display", "block")
        .style("opacity", 0.9)
        .attr("data-date", d[0])
        .html(html)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    };

    const hideTooltip = () => {
      tooltip.style("display", "none").style("opacity", 0);
    };

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("fill", (d) => (d.Doping ? "red" : "green"))
      .attr("stroke", (d) => (d.Doping ? "red" : "green"))
      .attr("cx", (d) => xScale(new Date(d.Year, 0, 1)))
      .attr("cy", (d) => yScale(d.Seconds))
      .attr("r", 5)
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => new Date(d.Seconds * 1000))
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    const legend = svg.append("g").attr("id", "legend").attr("class", "legend");

    const noDopingLegend = legend
      .append("g")
      .attr(
        "transform",
        "translate(" + (w - margin.right) + "," + margin.top + ")"
      )
      .attr("text-anchor", "end");

    noDopingLegend
      .append("rect")
      .attr("fill", "green")
      .attr("fill-opacity", 0.5)
      .attr("width", 20)
      .attr("height", 20);

    noDopingLegend
      .append("text")
      .attr("x", -5)
      .attr("y", 13)
      .attr("style", "font-size: 13px")
      .text("No doping allegations");

    const dopingLegend = legend
      .append("g")
      .attr(
        "transform",
        "translate(" + (w - margin.right) + "," + (margin.top + 25) + ")"
      )
      .attr("text-anchor", "end");

    dopingLegend
      .append("rect")
      .attr("fill", "red")
      .attr("fill-opacity", 0.5)
      .attr("width", 20)
      .attr("height", 20);

    dopingLegend
      .append("text")
      .attr("x", -5)
      .attr("y", 13)
      .attr("style", "font-size: 13px")
      .text("Doping allegations");
  };

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
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

export default ScatterPlot;
