import { useEffect, useRef } from "react";
import * as d3 from "d3";

const BarChart = () => {
  const container = useRef();

  const createChart = (data) => {
    d3.select(container.current)
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .text("United States GDP");

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
      .attr("x", -h + margin.bottom * 2.5)
      .attr("y", margin.left + 20)
      .text(data.name);

    const xScale = d3
      .scaleTime()
      .domain([new Date(data.from_date), new Date(data.to_date)])
      .range([margin.left, w - margin.right]);

    const xAxis = d3.axisBottom(xScale);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + (h - margin.bottom) + ")")
      .call(xAxis);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.data, (d) => d[1])])
      .range([h - margin.bottom, margin.top]);

    const yAxis = d3.axisLeft(yScale);

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
      .style("padding", "10px")
      .style("border-radius", "5px");

    const showTooltip = (event, d) => {
      const date = new Date(d[0]);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      const value = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(d[1]);

      const html =
        "<div style='text-align:center'>" +
        year +
        " Q" +
        quarter +
        "<br>" +
        value +
        " Billion" +
        "</div>";

      tooltip
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

    const rectWidth = (w - margin.left - margin.right) / data.data.length;

    svg
      .selectAll("rect")
      .data(data.data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(new Date(d[0])) - rectWidth / 2)
      .attr("y", (d) => yScale(d[1]))
      .attr("width", rectWidth)
      .attr("height", (d) => yScale(0) - yScale(d[1]))
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("fill", "rgb(0,122,255)")
      .attr("class", "bar")
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    const descriptionDiv = d3
      .select(container.current)
      .append("div")
      .attr("class", "description");

    descriptionDiv.append("p").text(
      "From " +
        new Date(data.from_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }) +
        " to " +
        new Date(data.to_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
    );

    descriptionDiv.append("p").text(data.description);
  };

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
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

export default BarChart;
