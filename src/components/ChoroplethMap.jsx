import * as d3 from "d3";
import { useEffect, useRef } from "react";
import * as topojson from "topojson-client";

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth
function choropleth(
  chartElement,
  data,
  {
    id = (d) => d.id, // given d in data, returns the feature id
    value = () => undefined, // given d in data, returns the quantitative value
    title, // given a feature f and possibly a datum d, returns the hover text
    format, // optional format specifier for the title
    scale = d3.scaleSequential, // type of color scale
    domain, // [min, max] values; input of color scale
    range = d3.interpolateBlues, // output of color scale
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    projection, // a D3 projection; null for pre-projected geometry
    features, // a GeoJSON feature collection
    featureId = (d) => d.id, // given a feature, returns its id
    borders, // a GeoJSON object for stroking borders
    outline = projection && projection.rotate ? { type: "Sphere" } : null, // a GeoJSON object for the background
    unknown = "#ccc", // fill color for missing data
    fill = "white", // fill color for outline
    stroke = "white", // stroke color for borders
    strokeLinecap = "round", // stroke line cap for borders
    strokeLinejoin = "round", // stroke line join for borders
    strokeWidth, // stroke width for borders
    strokeOpacity, // stroke opacity for borders
  } = {}
) {
  // Compute values.
  const N = d3.map(data, id);
  const V = d3.map(data, value).map((d) => (d == null ? NaN : +d));
  const Im = new d3.InternMap(N.map((id, i) => [id, i]));
  const If = d3.map(features.features, featureId);

  // Compute default domains.
  if (domain === undefined) domain = d3.extent(V);

  // Construct scales.
  const color = scale(domain, range);
  if (color.unknown && unknown !== undefined) color.unknown(unknown);

  // Compute titles.
  // if (title === undefined) {
  //   format = color.tickFormat(100, format);
  //   title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
  // } else if (title !== null) {
  //   const T = title;
  //   const O = d3.map(data, (d) => d);
  //   title = (f, i) => T(f, O[i]);
  // }

  // Compute the default height. If an outline object is specified, scale the projection to fit
  // the width, and then compute the corresponding height.
  // if (height === undefined) {
  //   if (outline === undefined) {
  //     height = 400;
  //   } else {
  //     const [[x0, y0], [x1, y1]] = d3
  //       .geoPath(projection.fitWidth(width, outline))
  //       .bounds(outline);
  //     const dy = Math.ceil(y1 - y0),
  //       l = Math.min(Math.ceil(x1 - x0), dy);
  //     projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);
  //     height = dy;
  //   }
  // }

  // Construct a path generator.
  const path = d3.geoPath(projection);

  const svg = chartElement
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");

  if (outline != null)
    svg
      .append("path")
      .attr("fill", fill)
      .attr("stroke", "currentColor")
      .attr("d", path(outline));

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", (d) => `translate(${400}, ${-570})`);

  const legendElementWidth = 70;
  const legendHeight = 15;

  const legendBins = color.range();

  legend
    .selectAll("rect")
    .data(legendBins)
    .enter()
    .append("rect")
    .attr("x", (d, i) => legendElementWidth * i)
    .attr("y", height - 2 * legendHeight)
    .attr("width", legendElementWidth)
    .attr("height", legendHeight)
    .attr("fill", (d) => d);

  legend
    .selectAll("text")
    .data(legendBins)
    .enter()
    .append("text")
    .text((d, i) => {
      const extent = color.invertExtent(d);
      const format = d3.format(".0%");
      return format(+extent[0] / 100) + " - " + format(+extent[1] / 100);
    })
    .attr("x", (d, i) => legendElementWidth * i + 14)
    .attr("y", height - 5)
    .style("font-size", "10px")
    .style("font-weight", "500")
    .style("fill", "#000");

  const tooltip = chartElement
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
      (d) => data.find((item) => item.fips === d.id)?.bachelorsOrHigher
    )
    .attr("fill", (d, i) => color(V[Im.get(If[i])]))
    .attr("d", path)
    .on("mouseover", showTooltip)
    .on("mouseout", hideTooltip);
  // .append("title")
  // .text((d, i) => title(d, Im.get(If[i])));

  if (borders != null)
    svg
      .append("path")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("d", path(borders));

  return Object.assign(svg.node(), { scales: { color } });
}

const ChoroplethMap = () => {
  const containerRef = useRef();

  const createMap = (countyData, statemesh, statemap, educationData) => {
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

    const chart = container.append("div").attr("class", "choropleth");

    choropleth(chart, educationData, {
      id: (d) => d.fips,
      value: (d) => d.bachelorsOrHigher,
      scale: d3.scaleQuantize,
      domain: [
        d3.min(educationData, (d) => d.bachelorsOrHigher),
        d3.max(educationData, (d) => d.bachelorsOrHigher),
      ],
      range: d3.schemeGreens[7],
      features: countyData,
      borders: statemesh,
      width: 975,
      height: 610,
    });
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
        const states = topojson.feature(topology, topology.objects.states);
        const statemap = new Map(states.features.map((d) => [d.id, d]));
        const statemesh = topojson.mesh(
          topology,
          topology.objects.states,
          (a, b) => a !== b
        );

        createMap(counties, statemesh, statemap, data);
      });
  }, []);

  return (
    <div className="root">
      <div ref={containerRef} className="container" />
    </div>
  );
};

export default ChoroplethMap;
