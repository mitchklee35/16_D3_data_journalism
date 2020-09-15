var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, YAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    YAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return YAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup
    , newXScale
    , chosenXAxis
    , newYScale
    , chosenYAxis
    // , circlesTextGroup
    ) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup

}


// function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {

//     var label;
//     var label2;

//     if (chosenXAxis === "poverty") {
//         label = "Poverty:";
//         label2 = "Obesity:";
//     }


//     var toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function (d) {
//             return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
//         });

//     circlesGroup.call(toolTip);

//     circlesGroup.on("mouseover", function (data) {
//         toolTip.show(data);
//     })
//         // onmouseout event
//         .on("mouseout", function (data, _index) {
//             toolTip.hide(data);
//         });

//     return circlesGroup;
// }

// Retrieve data from the CSV file and execute everything below
(async function () {
    var data = await d3.csv("assets/data/data.csv").catch(err => console.log(err))
    console.log(data)
    // parse data
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create y scale function
    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.healthcare)])
    //     .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        // .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);

    // append initial circles
    // var circlesGroup = chartGroup.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //     .attr("cy", d => yLinearScale(d[chosenYAxis]))
    //     .attr("r", 20)
    //     .attr("fill", "pink")
    //     .attr("opacity", ".5")
    //     .attr("classed", "stateCircle");

    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "lightblue")
        .attr("opacity", ".5")
        .attr("classed", "stateCircle");

    // // adding state abbreviation labels
    // var circlesTextGroup = chartGroup.selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .attr("x", d => xLinearScale(d[chosenXAxis]))
    //     .attr("y", d => yLinearScale(d[chosenYAxis]))
    //     .attr("text-anchor", "middle")
    //     .attr("stroke", "black")
    //     .attr("stroke-width", ".5px")
    //     .text(d => d.abbr)
    //     .attr("classed", "stateText");


    // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate( -100 , ${height - 150})`);

    var in_poverty = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var age_median = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var house_income = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var healthcare = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    var obese = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("axis-text", true)
        .text("Obese (%)");

    var smokes = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("axis-text", true)
        .text("Smokes (%)");

    // updateToolTip function above csv import
    //   var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
                console.log(xLinearScale, yLinearScale)
                console.log(chosenXAxis, chosenYAxis)
                console.log(xAxis, yAxis)
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup
                    , xLinearScale
                    , chosenXAxis
                    , yLinearScale
                    , chosenYAxis
                    // , circlesTextGroup
                );

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    age_median
                        .classed("active", true)
                        .classed("inactive", false);
                    in_poverty
                        .classed("active", false)
                        .classed("inactive", true);
                    house_income
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                    age_median
                        .classed("active", false)
                        .classed("inactive", true);
                    in_poverty
                        .classed("active", true)
                        .classed("inactive", false);
                    house_income
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    age_median
                        .classed("active", false)
                        .classed("inactive", true);
                    in_poverty
                        .classed("active", false)
                        .classed("inactive", true);
                    house_income
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }

        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection

            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);
                xLinearScale = xScale(data, chosenXAxis);


                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);
                console.log(xLinearScale, yLinearScale)
                console.log(chosenXAxis, chosenYAxis)
                console.log(xAxis, yAxis)
                // updates circles with new values
                circlesGroup = renderCircles(circlesGroup
                    , xLinearScale
                    , chosenXAxis
                    , yLinearScale
                    , chosenYAxis
                    // , circlesTextGroup
                );

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcare
                        .classed("active", true)
                        .classed("inactive", false);
                    obese
                        .classed("active", false)
                        .classed("inactive", true);
                    smokes
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    healthcare
                        .classed("active", false)
                        .classed("inactive", true);
                    obese
                        .classed("active", true)
                        .classed("inactive", false);
                    smokes
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcare
                        .classed("active", false)
                        .classed("inactive", true);
                    obese
                        .classed("active", false)
                        .classed("inactive", true);
                    smokes
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()
