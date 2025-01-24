import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const tabs = [
  { id: 0, name: "Kickstarter Data Set" },
  { id: 1, name: "Movies Data Set" },
  { id: 2, name: "Video Games Data Set" },
];

const titles = ["Kickstarter Pledges", "Movie Sales", "Video Game Sales"];

const subtitles = [
  "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
  "Top 100 Highest Grossing Movies Grouped By Genre",
  "Top 100 Most Sold Video Games Grouped by Platform",
];

const TreemapDiagram = () => {
  const containerRef = useRef();
  const [tab, setTab] = useState(0);

  const createChart = (data, tab) => {
    const container = d3.select(containerRef.current);

    container.selectAll("*").remove();

    container
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .style("text-align", "center")
      .text(titles[tab]);

    container
      .append("h2")
      .attr("class", "subtitle")
      .attr("id", "description")
      .style("text-align", "center")
      .text(subtitles[tab]);

    const chart = container.append("div").attr("class", "treemap");
    const width = 975;
    const height = 610;

    const svg = chart
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: auto; height: intrinsic;");

    const treemap = d3.treemap().size([width, height]).padding(0).round(true);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    const colorDomain = Array.from(
      new Set(root.leaves().map((d) => d.data.category))
    );

    const colorsItems = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
      "#aec7e8",
      "#ffbb78",
      "#98df8a",
      "#ff9896",
      "#c5b0d5",
      "#c49c94",
      "#f7b6d2",
      "#c7c7c7",
      "#dbdb8d",
      "#9edae5",
    ];

    const color = d3.scaleOrdinal().domain(colorDomain).range(colorsItems);

    const tooltip = chart
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
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
      const item = d.data;
      const name = "<p><b>Name: </b>" + item.name + "</p>";
      const category = "<p><b>Category: </b>" + item.category + "</p>";
      const value = "<p><b>Value: </b>" + item.value + "</p>";

      const html = "<div>" + name + category + value + "</div>";

      tooltip
        .attr("data-value", item.value)
        .style("display", "block")
        .style("opacity", 0.9)
        .html(html)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    };

    const hideTooltip = () => {
      tooltip.style("display", "none").style("opacity", 0);
    };

    const groups = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    groups
      .append("rect")
      .attr("class", "tile")
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("stroke", "white")
      .style("fill", (d) => color(d.data.category))
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    groups
      .append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(d.value))
      .join("tspan")
      .attr("x", 3)
      .attr(
        "y",
        (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
      )
      .attr("font-size", "10px")
      .text((d) => d);

    const legendWidth = 800;
    const legendHeight = 400;

    const legendSvg = container
      .append("div")
      .attr("class", "legend")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("id", "legend")
      .style("margin-top", "20px");

    const legendItem = legendSvg
      .selectAll("g")
      .data(colorDomain)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d, i) => `translate(${(i % 5) * 160}, ${Math.floor(i / 5) * 40})`
      );

    legendItem
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => color(d))
      .attr("class", "legend-item");

    legendItem
      .append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text((d) => d);
  };

  useEffect(() => {
    const urls = [
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
    ];

    fetch(urls[tab])
      .then((response) => response.json())
      .then((data) => {
        createChart(data, tab);
      });
  }, [tab]);

  return (
    <div className="root">
      <div className="treemap-tabs">
        {tabs.map((d) => (
          <button
            key={d.name}
            onClick={() => setTab(d.id)}
            style={{
              backgroundColor: tab === d.id ? "rgb(190, 190, 190)" : "#fff",
            }}
          >
            {d.name}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="container" />
    </div>
  );
};

export default TreemapDiagram;
