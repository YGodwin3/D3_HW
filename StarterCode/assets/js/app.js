// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, x => x[chosenXAxis]) * 0.6,
      d3.max(data, x => x[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, x => x[chosenYAxis]) * 0.8,
        d3.max(data, x => x[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
function renderCircles(circlesGroup, circlesText, newXScale, newYScale, chosenXaxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", x => newXScale(x[chosenXAxis]))
    .attr("cy", x => newYScale(x[chosenYAxis]));

  circlesText.transition()
    .duration(1000)
    .attr("x", x => newXScale(x[chosenXAxis]))
    .attr("y", x => newYScale(x[chosenYAxis]) )

  return circlesGroup;
}
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(x) {
      return (`${x.state}<br>${chosenXAxis}: ${x[chosenXAxis]}<br>${chosenYAxis}: ${x[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(x) {
    toolTip.show(x);
  })
    .on("mouseout", function(x, i) {
      toolTip.hide(x);
    });

  return circlesGroup;
}

(async function(){
data= await d3.csv("assets/data/data.csv")
  data.forEach(function(x) {
    x.poverty = +x.poverty;
    x.age = +x.age;
    x.income = +x.income;
    x.obesity = +x.obesity;
    x.smokes = +x.smokes;
    x.healthcare = +x.healthcare;
  });

  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", x => xLinearScale(x[chosenXAxis]))
    .attr("cy", x => yLinearScale(x[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "red")
    .attr("opacity", ".7");

  var circlesText = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", x => xLinearScale(x[chosenXAxis]))
    .attr("y", x => yLinearScale(x[chosenYAxis]))
    .text( x => x.abbr );

  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width}, ${height})`);

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform",`translate(0,${height})`);
   
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Household Income (Median)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-40px")
    .attr("value", "healthcare") 
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-60px")
    .attr("value", "smokes") 
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-80px")
    .attr("value", "obesity") 
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obesity (%)");
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function() {
    var value = d3.select(this).attr("value");
      
    if (value == chosenXAxis) return;

    chosenXAxis = value;

    xLinearScale = xScale(data, chosenXAxis);

    xAxis = renderXAxes(xLinearScale, xAxis);

    circlesGroup = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    [povertyLabel, ageLabel, incomeLabel].forEach(
        (label) => label
        .classed("inactive", true)
        .classed("active", false)
    );
    switch (chosenXAxis) {
        case "poverty":
            povertyLabel.classed("active", true);
            povertyLabel.classed("inactive", false);
            break;
        case "age":
            ageLabel.classed("active", true);
            ageLabel.classed("inactive", false);
            break;
        case "income":
            incomeLabel.classed("active", true);
            incomeLabel.classed("inactive", false);
            break;
    }
  });
  ylabelsGroup.selectAll("text")
    .on("click", function() {
    var value = d3.select(this).attr("value");
      
    if (value == chosenYAxis) return;
    chosenYAxis = value;

    yLinearScale = yScale(data, chosenYAxis);

    yAxis = renderYAxes(yLinearScale, yAxis);

    circlesGroup = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    [obesityLabel, smokesLabel, healthcareLabel].forEach(
        (label) => label
        .classed("inactive",true)
        .classed("active",false)
    );
    switch (chosenYAxis) {
        case "obesity":
            obesityLabel.classed("active", true);
            obesityLabel.classed("inactive", false);
            break;
        case "smokes":
            smokesLabel.classed("active", true);
            smokesLabel.classed("inactive", false);
            break;
        case "healthcare":
            healthcareLabel.classed("active", true);
            healthcareLabel.classed("inactive", false);
            break;
    }
  });
})()