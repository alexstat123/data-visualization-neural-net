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
        Object.keys(node.originalData.config || []).forEach(measureName => {
            measureValue = node.originalData.config[measureName];
            //ID is not useful to display
            if (measureName === "id")
                return;

            if (measureName === "customValue")
                throw new Error("Field customValue is reserved");
            if (measureName === "customKey")
                throw new Error("Field customKey is reserved");
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
                measuresContainer[measureValue].customKey = measureName;
            }
            var typesContainer = measuresContainer[measureValue];

            if (!typesContainer[node.originalData.layerType]) {
                typesContainer[node.originalData.layerType] = 0;
            }

            typesContainer[node.originalData.layerType]++;
        })
    });

    /**
     * Need an array to bind to d3. The key we lose in the process is already duplicated inside
     * @type {any[]}
     */
    var tmp = Object.values(data);

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
        .attr("class", "svg_container card");

    var svgContainersMerge = svgContainerEnter.merge(svgContainers);

    /**
     * SVG TITLE MANAGEMENT
     */
    svgContainerEnter
        .append("div")
        .attr("class", "svg_title");

    svgContainersMerge
        .select(".svg_title")
        .text(measure => measure.customName);

    /**
     * SVG MANAGEMENT
     */
    var svgEnter = svgContainerEnter
        .append("svg")
        .attr("class", "svg_measure mx-2");

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
            var domain = Array.from(measure.domain).sort((a, b) => (a - b) || (a < b ? -1 : 1));
            //Need to get distincts keys in all the layers
            var keys = dataArray.map(row => Object.keys(row).filter(key => key !== "customValue" && key !== "customKey"));
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
            const marginRight=5;
            const height = 150 - margins - marginRight;
            const width = this.getBoundingClientRect().width;
            var xScale = d3.scaleBand()
                .domain(domain)
                .range([margins, width - marginRight])
                .padding(0.1);

            var yScale = d3.scaleLinear()
                .domain([0, maxY])
                .nice()
                .range([height, margins]);

            d3.select(this).interrupt();


            var rects = d3.select(this)
                .selectAll(".rectangleContainer")
                .data(stack, row => row.key);

            rects.interrupt();
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
                .append("rect")
                .attr("class", "bar");


            var rectExits =
                rectsUpdate.exit();

            rectsEnter.interrupt();
            rectsUpdate.interrupt();
            rectExits.interrupt();

            rectsEnter
                .attr("y", row => yScale(row[0]))
                .attr("x", row => xScale(row.data.customValue))
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", function () {
                    return graph.nodesColorScale(nodeType.get(this))
                })
                .attr("opacity", 1)
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


            var hovers = d3.select(this)
                .selectAll(".hoverCatcher")
                .data(stack[0], elem => elem.data['customValue']);

            hovers.interrupt();

            hovers = hovers
                .enter()
                .append("rect")
                .attr("class", "hoverCatcher")
                .merge(hovers);

            hovers
                .attr("x", elem => xScale(elem.data['customValue']))
                .attr("y", yScale(maxY))
                .attr("height", height - yScale(maxY))
                .attr("width", xScale.bandwidth())
                .attr("opacity", 0)
                .raise();

            hovers.exit().remove();

            hovers
                .on("mouseenter", function (rect) {

                    rectsUpdate
                        .merge(rectsEnter)
                        .transition(800)
                        .attr("opacity", node => node.data.customValue === rect.data.customValue ? 1 : 0.2);

                    $(window).trigger("opacityOverride", [graph.getSelectedNodes().filter(node => node.originalData.config[rect.data.customKey] === rect.data.customValue)]);
                })
                .on("mouseleave", () => {
                    rectsUpdate
                        .merge(rectsEnter)
                        .transition(800)
                        .attr("opacity", 1);
                    $(window).trigger("opacityOverride", []);
                });

        });
}

$(window).on("mouseOverNode", (event, node) => updateMeasureOpacity(node));
$(window).on("mouseOutNode", (event, node) => updateMeasureOpacity(null));

function updateMeasureOpacity(measures) {
    const rectMeasures = d3
        .select("#container_layersInfo")
        .selectAll(".bar")
        .transition(800);

    if (!measures) {

        rectMeasures.attr("opacity", 1);
        return;
    }
    measures = measures.originalData.config;
    const keys = Object.keys(measures);
    rectMeasures
        .attr("opacity", data => {
            data = data.data;
            return keys.indexOf(data.customKey) !== -1 && data.customValue === measures[data.customKey] ? 1 : 0.2;
        });
}