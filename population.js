const chart_data = await fetch('./population_piechart.json').then((response) => {return response.json()});
const stacked_chart_data = await fetch('./population_stackedbarchart.json').then((response) => {return response.json()});

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
}

plot(piechart, plot_piechart, chart_data["Tätigkeit"])
function plot_piechart(data){
    // Specify the chart’s dimensions.
    const width = 928;
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