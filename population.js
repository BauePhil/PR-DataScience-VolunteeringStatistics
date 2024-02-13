//import * as Plot from "plot.js";
//var Plot = require("@observablehq/plot")
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const div = document.querySelector("#plot");
div.append(plot);