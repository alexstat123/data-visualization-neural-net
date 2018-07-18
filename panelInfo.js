function intersectKeys(firstSet, ...sets) {
    var count = sets.length;
    var result = new Set(firstSet); // Only create one copy of the set
    firstSet.forEach(item => {
        var i = count;
        var allHave = true;
        while (i--) {
            allHave = sets[i].has(item);
            if (!allHave) {
                break
            }  // loop only until item fails test
        }
        if (!allHave) {
            result.delete(item);  // remove item from set rather than
                                  // create a whole new set
        }
    });
    return result;
}

$(window).on("nodesSelectionChanged", (event, selection) => updatePanel(selection));

/**
 *
 * @param newSelection The nodes which parameters will enter into the info panel
 */
function updatePanel(newSelection) {
    d3.select("#info_selectedLayersNum").text(newSelection.length);
    /**
     * Will contain nodes indexed by available fields in config json field
     * Will be used to display measures on the info panel
     * Stucture is:
     * data[measureName ( ex. numOutputs)]
     * - customName (duplicate of measureName)
     * - values [measureValue(ex. 10, 2024, 2x2, ecc)]  [layerType (ex. FullyConnected)]
     * @type {{}}
     */
    var data = {};

    newSelection.forEach(node => {

        for (const [measureName, measureValue] of Object.entries(node.originalData.config)) {
            //ID is not useful to display
            if (measureName === "id")
                return;

            if (measureName === "customName")
                throw new Error("Field customName is reserved");

            if (!data[measureName]) {
                data[measureName] = {};
                data[measureName].customName = measureName;
                data[measureName].values = {};
                data[measureName].domain = new Set();
            }
            data[measureName].domain.add(measureValue);

            var measuresContainer = data[measureName].values;

            if (!measuresContainer[measureValue]) {
                measuresContainer[measureValue] = {};
                measuresContainer[measureValue].customValue = measureValue;
            }
            var typesContainer = measuresContainer[measureValue];

            if (!typesContainer[node.originalData.layerType]) {
                typesContainer[node.originalData.layerType] = 0;
            }

            typesContainer[node.originalData.layerType]++;
        }
    });

    /**
     * Need an array to bind to d3. The key we lose in the process is already duplicated inside
     * @type {any[]}
     */
    var tmp = Object.keys(data).map(key => data[key]);
    console.log(tmp);

    var svgContainers = d3.select("#container_layersInfo")
        .selectAll(".svg_container")
        .data(tmp, m => m.customName);

    /**
     * SVG CONTAINER MANAGEMENT
     * Will contain all the DOM elements related to a single measure (ex. title, svg, ecc.)
     */
    var svgContainerEnter = svgContainers
        .enter()
        .append("div")
        .attr("class", "svg_container");

    var svgContainersMerge = svgContainerEnter.merge(svgContainers);

    /**
     * SVG TITLE MANAGEMENT
     */
    svgContainerEnter
        .append("p")
        .attr("class", "svg_title");

    svgContainersMerge
        .select(".svg_title")
        .text(measure => measure.customName);

    /**
     * SVG MANAGEMENT
     */
    var svgEnter = svgContainerEnter
        .append("svg")
        .attr("class", "svg_measure");

    svgContainers
        .exit()
        .remove();

    svgEnter.append("g")
        .attr("class", "xAxis");
    svgEnter.append("g")
        .attr("class", "yAxis");


    addMeasureSVG(svgContainersMerge.select(".svg_measure"));
}

function addMeasureSVG(svg) {


    svg
        .each(function (measure) {
            /**
             * DATA PROCESSING
             * Need to elaborate data in order to pass data to d3.stack()
             * d3.stack expect an array where each row contains all the data relative to one bar
             * Each row must contain one dictionary with the format {key: value, key1:value1, ecc.}
             * composed as:
             *
             */

                // Convert dictionary to array
            var dataArray = Object.keys(measure.values).map(key => measure.values[key]);
            var domain = Array.from(measure.domain);

            console.log(dataArray);
            //Need to get distincts keys in all the layers
            var keys = dataArray.map(row => Object.keys(row).filter(key => key !== "customValue"));
            //Flatten the array
            keys = [].concat.apply([], keys);
            //Get distincts elements only
            keys = Array.from(new Set(keys).values());
            // Setup default values
            dataArray.forEach(row => {
                keys.forEach(key => {
                    if (!row[key]) {
                        row[key] = 0;
                    }
                });
            });

            var stack = d3.stack().keys(keys)(dataArray);
            var maxY = d3.max(stack, row => d3.max(row, element => element[1]));

            const margins = 30;
            const height = 150 - margins * 2;
            const width = 298 - margins * 2;

            var xScale = d3.scaleBand()
                .domain(domain)
                .range([margins, width])
                .padding(0.1);

            var yScale = d3.scaleLinear()
                .domain([0, maxY])
                .nice()
                .range([height, margins]);


            var rects = d3.select(this)
                .selectAll(".rectangleContainer")
                .data(stack, row => console.log(row));


            rects
                .exit()
                .transition()
                .duration(800)
                .remove();


            var nodeType = d3.local();
            var rectsEnter = rects.enter().append("g")
                .attr("class", "rectangleContainer");


            var rectsContainer = rectsEnter
                .merge(rects)
                .property(nodeType, row => row.key);

            d3.select(this)
                .select(".xAxis")
                .attr("transform", "translate(0," + height + ")")
                .transition()
                .call(d3.axisBottom(xScale));

            d3.select(this)
                .select(".yAxis")
                .attr("transform", "translate(" + margins + ", 0)")
                .transition()
                .call(d3.axisLeft(yScale).ticks(Math.min(maxY, 5)));

            var rectsUpdate = rectsContainer
                .selectAll("rect")
                .data(d => d, function (d) {
                    return d.data.customValue + nodeType.get(this)
                });

            var rectsEnter = rectsUpdate
                .enter()
                .append("rect");

            var rectExits =
                rectsUpdate.exit();

            //   rectsUpdate
            //      .attr("y", row => yScale(row[1]));

            rectsEnter
                .attr("y", row => yScale(row[0]))
                .attr("x", row => xScale(row.data.customValue))
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", function () {
                    return graph.nodesColorScale(nodeType.get(this))
                })
                .transition()
                .delay(200)
                .duration(800)
                .attr("height", row => height - yScale(row[1] - row[0]))
                .attr("y", row => yScale(row[1]));

            rectsUpdate
                .transition()
                .duration(800)
                .attr("x", row => {
                    return xScale(row.data.customValue);
                })
                .attr("width", xScale.bandwidth())
                .attr("y", row => yScale(row[1]))
                .attr("height", row => height - yScale(row[1] - row[0]));

            rectExits
                .raise()
                .attr("opacity", 1)
                .transition()
                .duration(800)
                .attr("opacity", 0.4)
                .attr("y", function () {
                    const tmp = d3.select(this);
                    return parseFloat(tmp.attr("y")) + parseFloat(tmp.attr("height"));
                })
                .attr("height", 0)
                .remove();

        });


}