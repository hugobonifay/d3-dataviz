import * as d3 from "d3";
import { useEffect, useRef } from "react";
import * as topojson from "topojson-client";

const ChoroplethMap = () => {
  const containerRef = useRef();

  const createMap = (features, borders, data) => {
    const container = d3.select(containerRef.current);

    container.selectAll("*").remove();

    container
      .append("h1")
      .attr("id", "title")
      .attr("class", "title")
      .text("United States Educational Attainment");

    container
      .append("h2")
      .attr("class", "subtitle")
      .attr("id", "description")
      .text(
        "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
      );

    const color = d3.scaleQuantize(
      [
        d3.min(data, (d) => d.bachelorsOrHigher),
        d3.max(data, (d) => d.bachelorsOrHigher),
      ],
      d3.schemeGreens[7]
    );

    const path = d3.geoPath();

    const chart = container.append("div").attr("class", "choropleth");
    const width = 975;
    const height = 610;

    const svg = chart
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: auto; height: intrinsic;");

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
      const county = data.find((item) => item.fips === d.id);
      const countyName = county.area_name;
      const countyState = county.state;
      const countyBachelorsOrHigher = county.bachelorsOrHigher;

      const html =
        "<div><p>" +
        countyName +
        ", " +
        countyState +
        ": " +
        countyBachelorsOrHigher +
        "%</p></div>";

      tooltip
        .attr("data-education", countyBachelorsOrHigher)
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
      .selectAll("path")
      .data(features.features)
      .join("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr(
        "data-education",
        (d) => data.find((item) => item.fips === d.id).bachelorsOrHigher
      )
      .attr("fill", (d) =>
        color(data.find((item) => item.fips === d.id).bachelorsOrHigher)
      )
      .attr("d", path)
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    svg
      .append("path")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 1)
      .attr("d", path(borders));

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", (d) => `translate(${width / 2 - 50}, ${0})`);

    const legendItems = color.range();
    const legendItemWidth = 70;
    const legendItemHeight = 15;

    legend
      .selectAll("rect")
      .data(legendItems)
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendItemWidth * i)
      .attr("width", legendItemWidth)
      .attr("height", legendItemHeight)
      .attr("fill", (d) => d);

    legend
      .selectAll("text")
      .data(legendItems)
      .enter()
      .append("text")
      .text((d, i) => {
        const extent = color.invertExtent(d);
        const format = d3.format(".0%");
        return format(+extent[0] / 100) + " - " + format(+extent[1] / 100);
      })
      .attr("x", (d, i) => legendItemWidth * i + 15)
      .attr("y", legendItemHeight + 10)
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#000");
  };

  useEffect(() => {
    Promise.all([
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
      ),
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
      ),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((res) => {
        const [topology, data] = res;
        const counties = topojson.feature(topology, topology.objects.counties);
        // const states = topojson.feature(topology, topology.objects.states);
        // const statemap = new Map(states.features.map((d) => [d.id, d]));
        const statemesh = topojson.mesh(
          topology,
          topology.objects.states,
          (a, b) => a !== b
        );

        createMap(counties, statemesh, data);
      });
  }, []);

  return (
    <div className="root">
      <div ref={containerRef} className="container" />
    </div>
  );
};

export default ChoroplethMap;
