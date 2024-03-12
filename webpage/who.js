const chart_data = await fetch('../population_piechart.json').then((response) => {return response.json()});
const stacked_chart_data = await fetch('../population_stackedbarchart.json').then((response) => {return response.json()});
const sunburst_data = await fetch('../population_sunburst.json').then((response) => {return response.json()});


function plot(div, f_svg, data){
    const svg = f_svg(data)
    while(div.firstChild) { 
        div.removeChild(div.firstChild); 
    } 
    div.append(svg.node());
}

document.getElementById("category").onchange = function updateCategory() {
    var selected = document.getElementById("category").value;
    plot(piechart, plot_piechart, chart_data[selected])
    plot(barchart, plot_barchart, chart_data[selected])
    /* dont plot when "Tätigkeit" is selected*/
    plot(stacked_barchart, plot_stacked_barchart, stacked_chart_data[selected])
    plot(sunburst, plot_sunburst, sunburst_data[selected])
}

plot(piechart, plot_piechart, chart_data["Tätigkeit"])
function plot_piechart(data){
    // Specify the chart’s dimensions.
    const width = 450;
    const height = Math.min(width, 500);

    // Create the color scale.
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10)
        .unknown("#ccc");

    // Create the pie layout and arc generator.
    const pie = d3.pie()
        .sort(null)
        .value(d => d.frequency);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    // A separate arc generator for labels.
    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const format = d3.format(".2f");
    // Add a sector path for each value.
    svg.append("g")
        .attr("stroke", "white")
    .selectAll()
    .data(arcs)
    .join("path")
        .attr("fill", d => color(d.data.category))
        .attr("d", arc)
    //.append("title")
    //  .text(d => `${d.data.category}\n${format(d.data.frequency*100)} %`);

    // Create a new arc generator to place a label close to the edge.
    // The label shows the value if there is enough room.
    svg.append("g")
        .attr("text-anchor", "middle")
    .selectAll()
    .data(arcs)
    .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.category))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => `${format(d.data.frequency*100)} %`));

    return svg;
}

plot(barchart, plot_barchart, chart_data["Tätigkeit"])
function plot_barchart(data){
    // Declare the chart dimensions and margins.
    const width = 450;
    const height = 450;
    const marginTop = 0;
    const marginRight = 0;
    const marginBottom = 0;
    const marginLeft = 0;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleBand()
        //.domain(d3.groupSort(nonstackedpopdata[category], ([d]) => -d.frequency, (d) => d.category)) // descending frequency
        .domain(new Set(data.map(d => d.category)))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    
    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.frequency)])
        .range([height - marginBottom, marginTop]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10)
        .unknown("#ccc");

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, 0, width, height+25])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a rect for each bar.
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.category))
        .attr("y", (d) => y(d.frequency))
        .attr("height", (d) => y(0) - y(d.frequency))
        .attr("width", x.bandwidth())
        .attr("fill", (d) => color(d.category));

    // Add the x-axis and label.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        //.selectAll("text")
        //.attr("transform", "rotate(-20)")
        //.style("text-anchor", "end");

    // Add the y-axis and label, and remove the domain line.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Frequency (%)"));

    //add % text
    svg.selectAll(".text")   
        .data(data)
        .enter()
        .append("text")
        .attr("class","label")
        .attr("x", function(d) { return x(d.category) + x.bandwidth()/2 - 20;})
        .attr("y", function(d) { return y(d.frequency) -20; })
        .attr("dy", ".75em")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "10pt")
        .text(function(d) { return `${d3.format(".2f")(d.frequency*100)} %`; }); 
    
    // Return the SVG element.
    return svg;
}

/*TODO: Legend*/
plot(stacked_barchart, plot_stacked_barchart, chart_data["Tätigkeit"])
function plot_stacked_barchart(data){
    // Specify the chart’s dimensions.
    const width = 960;
    const height = 450;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;
    
    // Determine the series that need to be stacked.
    const series = d3.stack()
        .keys(d3.union(data.map(d => d.type))) // distinct series keys, in input order
        .value(([, D], key) => D.get(key).frequency) // get value for each series key and stack
        (d3.index(data, d => d.category, d => d.type)); // group by stack then series key
    
    // Prepare the scales for positional and color encodings.
    const x = d3.scaleBand()
        .domain(d3.groupSort(data, D => -d3.sum(D, d => d.frequency), d => d.category))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([height - marginBottom, marginTop]);
    
    const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeTableau10)
        .unknown("#ccc");
    
    // A function to format the value in the tooltip.
    const formatValue = x => d3.format(".2f")(x*100)
    
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
    
    // Append a group for each series, and a rect for each element in the series.
    svg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(D => D.map(d => (d.key = D.key, d)))
        .join("rect")
        .attr("x", d => x(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .append("title")
        .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).frequency)}%`);
    
    // Append the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove());
    
    // Append the vertical axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "%"))
        .call(g => g.selectAll(".domain").remove());
    
    // Return the chart with the color scale as a property (for the legend).
    return svg;
}

plot(sunburst, plot_sunburst, chart_data["Tätigkeit"])
function plot_sunburst(data){
    // Specify the chart’s dimensions.
  const width = 1000;
  const height = width;
  const radius = width / 6;

  // Create the color scale.
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length+1));

  // Compute the layout.
  const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
  const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
  root.each(d => d.current = d);

  // Create the arc generator.
  const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");

  // Append the arcs.
  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

      .attr("d", d => arc(d.current));

  // Make them clickable if they have children.
  path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

  const format = d3.format(".2f");
  path.append("title")
      .text(d => `${format(d.value*100)}%`);

  const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

  const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

  // Handle zoom on click.
  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  return svg;
}