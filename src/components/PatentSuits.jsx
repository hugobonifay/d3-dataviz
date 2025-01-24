import { useEffect, useRef } from "react";
import * as d3 from "d3";

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

const PatentSuits = () => {
  const containerRef = useRef();

  const createChart = (data) => {
    const container = d3.select(containerRef.current);

    container.selectAll("*").remove();

    container
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .text(
        "A view of patent-related lawsuits in the mobile communications industry, circa 2011."
      );

    const chart = container.append("div").attr("class", "chart");
    const width = 928;
    const height = 600;

    const types = Array.from(new Set(data.map((d) => d.type)));
    const nodes = Array.from(
      new Set(data.flatMap((l) => [l.source, l.target])),
      (id) => ({ id })
    );
    const links = data.map((d) => Object.create(d));

    const color = d3.scaleOrdinal(types, d3.schemeCategory10);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = chart
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

    // Per-type markers, as they don't inherit styles.
    svg
      .append("defs")
      .selectAll("marker")
      .data(types)
      .join("marker")
      .attr("id", (d) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => color(d.type))
      .attr(
        "marker-end",
        (d) => `url(${new URL(`#arrow-${d.type}`, location)})`
      );

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
      const asSource = data.filter((a) => a.source === d.id);
      const asTarget = data.filter((a) => a.target === d.id);

      const targets = asSource
        .map(
          (a) =>
            `<span style='color: ${color(a.type)}'>${a.target} (${
              a.type
            })</span>`
        )
        .join(", ");

      const sources = asTarget
        .map(
          (a) =>
            `<span style='color: ${color(a.type)}'>${a.source} (${
              a.type
            })</span>`
        )
        .join(", ");

      const html =
        "<div>" +
        "<p><b>Targets: </b>" +
        targets +
        "</p>" +
        "<p><b>Sources: </b>" +
        sources +
        "</p>" +
        "</div>";

      tooltip
        .style("display", "block")
        .style("opacity", 0.9)
        .html(html)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    };

    const hideTooltip = () => {
      tooltip.style("display", "none").style("opacity", 0);
    };

    const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    node
      .append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("r", 4);

    node
      .append("text")
      .attr("x", 8)
      .attr("y", "0.31em")
      .text((d) => d.id)
      .clone(true)
      .lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr(
        "transform",
        (d) => `translate(${-width / 2 + 30}, ${-height / 2 + 30})`
      );

    const legendItems = types.map((d) => ({ type: d, color: color(d) }));
    const legendItemWidth = 15;
    const legendItemHeight = 15;

    legend
      .selectAll("rect")
      .data(legendItems)
      .enter()
      .append("rect")
      .attr("y", (d, i) => i * legendItemHeight + i * 5)
      .attr("width", legendItemWidth)
      .attr("height", legendItemHeight)
      .attr("fill", (d) => d.color);

    legend
      .selectAll("text")
      .data(legendItems)
      .enter()
      .append("text")
      .text((d, i) => d.type)
      .attr("x", (d, i) => legendItemWidth + 4)
      .attr(
        "y",
        (d, i) => i * legendItemHeight + legendItemHeight / 2 + 3 + i * 5
      )
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#000");

    // invalidation.then(() => simulation.stop());

    return Object.assign(svg.node(), { scales: { color } });
  };

  useEffect(() => {
    const data = [
      { source: "Microsoft", target: "Amazon", type: "licensing" },
      { source: "Microsoft", target: "HTC", type: "licensing" },
      { source: "Samsung", target: "Apple", type: "suit" },
      { source: "Motorola", target: "Apple", type: "suit" },
      { source: "Nokia", target: "Apple", type: "resolved" },
      { source: "HTC", target: "Apple", type: "suit" },
      { source: "Kodak", target: "Apple", type: "suit" },
      { source: "Microsoft", target: "Barnes & Noble", type: "suit" },
      { source: "Microsoft", target: "Foxconn", type: "suit" },
      { source: "Oracle", target: "Google", type: "suit" },
      { source: "Apple", target: "HTC", type: "suit" },
      { source: "Microsoft", target: "Inventec", type: "suit" },
      { source: "Samsung", target: "Kodak", type: "resolved" },
      { source: "LG", target: "Kodak", type: "resolved" },
      { source: "RIM", target: "Kodak", type: "suit" },
      { source: "Sony", target: "LG", type: "suit" },
      { source: "Kodak", target: "LG", type: "resolved" },
      { source: "Apple", target: "Nokia", type: "resolved" },
      { source: "Qualcomm", target: "Nokia", type: "resolved" },
      { source: "Apple", target: "Motorola", type: "suit" },
      { source: "Microsoft", target: "Motorola", type: "suit" },
      { source: "Motorola", target: "Microsoft", type: "suit" },
      { source: "Huawei", target: "ZTE", type: "suit" },
      { source: "Ericsson", target: "ZTE", type: "suit" },
      { source: "Kodak", target: "Samsung", type: "resolved" },
      { source: "Apple", target: "Samsung", type: "suit" },
      { source: "Kodak", target: "RIM", type: "suit" },
      { source: "Nokia", target: "Qualcomm", type: "suit" },
    ];

    createChart(data);
  }, []);

  return (
    <div className="root">
      <div ref={containerRef} className="container" />
    </div>
  );
};

export default PatentSuits;
