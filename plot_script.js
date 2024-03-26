const chart_data = await fetch('data/population_piechart.json').then((response) => {return response.json()});
const stacked_chart_data = await fetch('data/population_stackedbarchart.json').then((response) => {return response.json()});
const sunburst_data = await fetch('data/population_sunburst.json').then((response) => {return response.json()});
const deltat = await fetch('data/deltaT.json').then((response) => {return response.json()});
const worktype_data = await fetch('data/worktype.json').then((response) => {return response.json()});
const motivation_extra = {negative: "Ablehnung", positive: "Zustimmung", negatives: ["gar nicht", "eher nein"], positives: ["eher ja", "voll und ganz"]}
var motivation_yes_data = await fetch('data/motivation_yes.json').then((response) => {return response.json()});
motivation_yes_data = Object.assign(motivation_yes_data, motivation_extra)
var motivation_no_data = await fetch('data/motivation_no.json').then((response) => {return response.json()});
motivation_no_data = Object.assign(motivation_no_data, motivation_extra)

function plot(div, f_svg, data){
    const svg = f_svg(data)
    while(div.firstChild) { 
        div.removeChild(div.firstChild); 
    } 
    div.append(svg);
}

document.getElementById("category").onchange = () => {
    const selected = document.getElementById("category").value;
    plot(piechart, plot_piechart, chart_data[selected])
    plot(barchart, plot_barchart, chart_data[selected])
    //dont plot when "Tätigkeit" is selected
    if (selected == "Tätigkeit") {
        stacked_div.style.opacity = 0.25
        sunburst_div.style.opacity = 0.25
    } else {
        stacked_div.style.opacity = 1
        sunburst_div.style.opacity = 1
        plot(stacked_barchart, plot_stacked_barchart, stacked_chart_data[selected])
        plot(sunburst, plot_sunburst, sunburst_data[document.getElementById("sunburst_select").value][selected])
    }

    console.log(selected)
    if (selected == "Staatsbürgerschaft" || selected == "Teilnahme am Erwerbsleben"){
        time_linechart_div.style.opacity = 0.25
        time_barchart_div.style.opacity = 0.25
    } else {
        time_linechart_div.style.opacity = 1
        time_barchart_div.style.opacity = 1
        plot(time_linechart, plot_time_line_chart, deltat[selected])
        plot(time_barchart, plot_time_bar_chart, deltat[selected])
    }
}

document.getElementById("sunburst_select").onchange = () => {
    const selectedcategory = document.getElementById("category").value;
    const subursttype = document.getElementById("sunburst_select").value;
    plot(sunburst, plot_sunburst, sunburst_data[subursttype][selectedcategory])
}

plot(piechart, plot_piechart, chart_data["Geschlecht"])
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

    return svg.node()
}

plot(barchart, plot_barchart, chart_data["Geschlecht"])
function plot_barchart(data){
    // Declare the chart dimensions and margins.
    const width = 450;
    const height = 450;
    const marginTop = 25;
    const marginRight = 0;
    const marginBottom = 0;
    const marginLeft = 10;

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
        .call(d3.axisLeft(y).ticks(null, "%"))
        .call(g => g.select(".domain").remove());
        /*.call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 15)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Anteil"));*/

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
    return svg.node()
}

stacked_chart_legend.append(Legend(d3.scaleOrdinal(["Nur Informelle Freiwilligentätigkeit", "Nur Formelle Freiwilligentätigkeit", "Informelle und Formelle Freiwilligentätigkeit"], d3.schemeTableau10), {
    title: "Art der Freiwilligentätigkeit",
    tickSize: 0,
    width: 800,
    height: 45,
    marginLeft: 50,
    marginRight: 50
}));
plot(stacked_barchart, plot_stacked_barchart, stacked_chart_data["Geschlecht"])
function plot_stacked_barchart(data){
    // Specify the chart’s dimensions.
    const width = 980;
    const height = 420;
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
    return svg.node()
}

plot(sunburst, plot_sunburst, sunburst_data["Gesamt"]["Geschlecht"])
function plot_sunburst(data){
    // Specify the chart’s dimensions.
  const width = 950;
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
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: 100%; font: 10px sans-serif;");

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

  return svg.node()
}

plot(time_linechart, plot_time_line_chart, deltat["Geschlecht"])
function plot_time_line_chart(data) {
    // Specify the chart’s dimensions.
    const width = 500;
    const height = 450;
    const marginTop = 20;
    const marginRight = 75;
    const marginBottom = 25;
    const marginLeft = 25;
    
    // Create the horizontal, vertical and color scales.
    const x = d3.scaleLinear()
        .domain([data[0].jahr, data[data.length - 1].jahr])
        .range([marginLeft, width - marginRight]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height - marginBottom, marginTop]);
    
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10);
    
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "width: 100%; font: 12px sans-serif;");
    
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".0f")).tickValues(new Set(data.map(function(d) {return d.jahr}))));
    
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".domain").remove());
    
    // Add a container for each series.
    const serie = svg.append("g")
        .selectAll()
        .data(d3.group(data, d => d.category))
        .join("g");
    
    // Draw the lines.
    serie.append("path")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d => d3.line()
            .x(d => x(d.jahr))
            .y(d => y(d.value))(d[1]));
    
    // Append the labels.
    serie.append("g")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("text-anchor", "start")
        .selectAll()
        .data(d => d[1])
        .join("text")
        .text(d => d.value)
        .attr("dy", "0.35em")
        .attr("x", d => x(d.jahr))
        .attr("y", d => y(d.value))
        .call(text => text.filter((d, i, data) => i === data.length - 1)
            .append("tspan")
            .attr("font-weight", "bold")
            .text(d => ` ${d.category}`))
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 6);
    
    return svg.node();
}

time_bar_legend.append(Legend(d3.scaleOrdinal(["2000", "2009", "2014", "2019", "2022"], d3.schemeGnBu[9]), {
    title: "Jahr",
    tickSize: 0,
    width: 400,
    height: 40
}));
plot(time_barchart, plot_time_bar_chart, deltat["Geschlecht"])
function plot_time_bar_chart(data) {
    // Specify the chart’s dimensions.
    const width = 500;
    const height = 420;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;
    
    // Prepare the scales for positional and color encodings.
    // Fx encodes the state.
    const fx = d3.scaleBand()
        .domain(new Set(data.map(d => d.category)))
        .rangeRound([marginLeft, width - marginRight])
        .paddingInner(0.1);
    
    // Both x and color encode the age class.
    const ages = new Set(data.map(d => d.jahr));
    
    const x = d3.scaleBand()
        .domain(ages)
        .rangeRound([0, fx.bandwidth()])
        .padding(0.05);
    
    const color = d3.scaleOrdinal()
        .domain([2000, 2009, 2014, 2019, 2022])
        .range(d3.schemeGnBu[9])
        .unknown("#ccc");
    
    // Y encodes the height of the bar.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .rangeRound([height - marginBottom, marginTop]);
    
    // A function to format the value in the tooltip.
    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
    
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
    
    // Append a group for each state, and a rect for each age.
    svg.append("g")
        .selectAll()
        .data(d3.group(data, d => d.category))
        .join("g")
        .attr("transform", ([category]) => `translate(${fx(category)},0)`)
        .selectAll()
        .data(([, d]) => d)
        .join("rect")
        .attr("x", d => x(d.jahr))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.jahr));
    
    // Append the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(fx).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove());
    
    // Append the vertical axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.selectAll(".domain").remove());
    
    // Return the chart with the color scale as a property (for the legend).
    return svg.node();
}


function plotWorktypeLegend(data) {
    const color = d3.scaleOrdinal()
    .domain(new Set(data.map(d => d.category)))
    .range(d3.schemeTableau10)
    .unknown("#ccc");
    return Legend(color, {
        title: "Kategorie",
        tickSize: 0,
        width: 400,
        height: 40
    })
}
const updateWorktype = () => {
    const category = document.getElementById("worktype_category_select").value;
    const type = document.getElementById("worktype_type_select").value;
    const sorted_worktype_data = d3.reverse(d3.sort(worktype_data[type][category], (v)=> v.frequency))
    plot(worktype, plot_worktype_chart, sorted_worktype_data)
    plot(worktype_legend, plotWorktypeLegend, sorted_worktype_data)
}
document.getElementById("worktype_category_select").onchange = updateWorktype
document.getElementById("worktype_type_select").onchange = updateWorktype

const init_worktypedata = d3.reverse(d3.sort(worktype_data["Formelle Freiwilligentätigkeit"]["Gesamt"], (v)=> v.frequency))
plot(worktype_legend, plotWorktypeLegend, init_worktypedata)
plot(worktype, plot_worktype_chart, init_worktypedata)
function plot_worktype_chart(data){
    // Specify the chart’s dimensions.
    const width = 980;
    const height = 450;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 20;
    const marginLeft = -50;
  
    // Prepare the scales for positional and color encodings.
    // Fx encodes the state.
    const fx = d3.scaleBand()
        .domain(new Set(data.map(d => d.name)))
        .rangeRound([marginLeft, width - marginRight])
        .paddingInner(0.25);
  
    // Both x and color encode the age class.
    const ages = new Set(data.map(d => d.category));
  
    const x = d3.scaleBand()
        .domain(ages)
        .rangeRound([0, fx.bandwidth()])
        .padding(0.05);
    
    const color = d3.scaleOrdinal()
        .domain(ages)
        .range(d3.schemeTableau10)
        .unknown("#ccc");
  
    // Y encodes the height of the bar.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.frequency)]).nice()
        .rangeRound([height - marginBottom, marginTop]);
  
    // A function to format the value in the tooltip.
    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
  
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width+20, height+100])
        .attr("style", "max-width: 100%; height: 100%");
  
    // Append a group for each state, and a rect for each age.
    svg.append("g")
      .selectAll()
      .data(d3.group(data, d => d.name))
      .join("g")
        .attr("transform", ([name]) => `translate(${fx(name)},0)`)
      .selectAll()
      .data(([, d]) => d)
      .join("rect")
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.frequency))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.frequency))
        .attr("fill", d => color(d.category));
  
    // Append the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(fx).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
        .selectAll("text")
        .attr("font-size", "10pt")
        .attr("transform", "rotate(15)")
        .style("text-anchor", "start");
  
    // Append the vertical axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "%"))
        .call(g => g.selectAll(".domain").remove());
  
    // Return the chart with the color scale as a property (for the legend).
    return svg.node();
}

why_legend.append(Legend(d3.scaleOrdinal(["gar nicht", "eher nein", "eher ja", "voll und ganz"], d3.schemeRdBu[4]), {
    title: "Zustimmung",
    tickSize: 0,
    width: 400,
    height: 40
}));
plot(why_yes, plot_motivation_chart, motivation_yes_data)
plot(why_no, plot_motivation_chart, motivation_no_data)
function plot_motivation_chart(data) {
    // Assign a valence to each category.
    const signs = new Map([].concat(
        data.negatives.map(d => [d, -1]),
        data.positives.map(d => [d, +1])
    ));

    // Compute the bias = sum of negative values for each candidate.
    const bias = d3.sort(
    d3.rollup(data, v => d3.sum(v, d => d.value * Math.min(0, signs.get(d.category))), d => d.name),
    ([, a]) => a
    );

    // Specify the chart’s dimensions, with a space of height 33px for each candidate.
    const width = 990;
    const marginTop = 40;
    const marginRight = 30;
    const marginBottom = 0;
    const marginLeft = 280;
    const height = bias.length * 33 + marginTop + marginBottom;

    // Prepare the stack; the values are stacked from the inside out, starting with more
    // moderate values (“mostly false”, “half true”), and ending with the extreme values.
    const series = d3.stack()
    .keys([].concat(data.negatives.slice().reverse(), data.positives))
    .value(([, value], category) => signs.get(category) * (value.get(category) || 0))
    .offset(d3.stackOffsetDiverging)
    (d3.rollup(data, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.name));

    // Construct the scales.
    const x = d3.scaleLinear()
    .domain(d3.extent(series.flat(2)))
    .rangeRound([marginLeft, width - marginRight])

    const y = d3.scaleBand()
    .domain(bias.map(([name]) => name))
    .rangeRound([marginTop, height - marginBottom])
    .padding(2 / 33)

    const color = d3.scaleOrdinal()
    .domain([].concat(data.negatives, data.positives))
    .range(d3.schemeRdBu[data.negatives.length + data.positives.length])

    // A function to format a percentage, used both on the axis and in the tooltips.
    const formatValue = ((format) => (x) => format(Math.abs(x)))(d3.format(".0%"));

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Append a rect for each value, with a tooltip.
    svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
        .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d.map(v => Object.assign(v, {key: d.key})))
    .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", ({data: [name]}) => y(name))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
    .append("title")
        .text(({key, data: [name, value]}) => `${name}
    ${formatValue(value.get(key))} ${key}`);

    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
    .call(d3.axisTop(x)
        .ticks(width / 80)
        .tickFormat(formatValue)
        .tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", x(0) + 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.positive))
    .call(g => g.append("text")
        .attr("x", x(0) - 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(data.negative));

    svg.append("g")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").data(bias).attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
    .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`));

    // Return the color scale as a property of the node, for the legend.
    return svg.node();
}