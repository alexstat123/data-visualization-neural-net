var legendItem = null;
$(window).on("load", setup);
$(window).on("graphLoaded", (event, graph) => drawLegend(graph));
$(window).on("nodesSelectionChanged", (event, newSelection) => updateSelection(newSelection));

function setup() {
    legendItem = d3.select(".legendItem").remove().node();
}

function drawLegend(graph) {
    // svg container
    var layersLegends = d3.select("#layersLegend");
    // g elements
    var itemsUpdate = layersLegends
        .selectAll("g.legendItem")
        .data(graph.getLayersColors(), type => type.type);

    var padding = 5;
    var lineHeight = 30 - padding;

    var itemsEnter = itemsUpdate
        .enter()
        .append("g")
        .attr("class", "legendItem");

    const itemsMerge = itemsEnter
        .merge(itemsUpdate);

    //g is bound to the type, so we only set the text into the enter section
    itemsEnter
        .append("text")
        .attr("class", "type")
        .attr("dominant-baseline", "middle")
        .attr("x", lineHeight + (padding * 2))
        .text(layer => layer.type);

    //Same as before, g is bound to type, we only set the color when it enters
    itemsEnter
        .append("rect")
        .attr("class", "square")
        //i prefer rectangles instead of squares
        .attr("width", lineHeight + padding)
        .attr("height", lineHeight)
        .attr("fill", layer => layer.color);

    itemsEnter
        .on("click", data => {
            console.log(data);
            if (d3.event.ctrlKey) {
                var nodes = graph
                    .filterNodes(node => node.originalData.layerType === data.type);

                var toChange = nodes.filter(node => !node.selected);
                if (toChange.length === 0) {
                    toChange = nodes;
                }

                toChange.forEach(node => node.selected = !node.selected);
            } else {
                graph.selectNodesPrep(node => {
                    console.log(node);
                    return node.originalData.layerType === data.type;
                });
            }
            $(window).trigger("nodesSelectionChanged", [graph.getSelectedNodes()]);
        });

    //We may allow to reorder the legend if future, so y is on the merge section
    itemsMerge
        .select(".square")
        .attr("y", (d, i) => (lineHeight + padding) * i);

    itemsMerge
        .select(".type")
        .attr("y", (d, i) => ((lineHeight + padding) * i) + lineHeight / 2);

    itemsUpdate.exit().remove();

    var box = layersLegends.node().getBBox();
    layersLegends.attr("height", box.height);
}

function updateSelection(newSelection) {
    d3.select("#svg_NNContainer")
        .selectAll(".svg_layer")
        .data(graph.nodesArray, node => node.id)
        .attr("stroke", node => node.selected ? "#000000" : "#898989")
        .attr("stroke-width", 1);

    d3.select("#svg_NNContainer")
        .selectAll(".svg_layer")
        .data(graph.getSelectedNodes(), node => node.id)
        .raise();

    d3.select("#svg_NNContainer")
        .selectAll("text")
        .data(graph.getSelectedNodes(), node => node.id)
        .raise();

    var layersLegends = d3.select("#layersLegend")
        .selectAll(".legendItem")
        .data(newSelection.map(node => node.type), type => type.type);

    layersLegends.select(".type")
        .attr("font-weight", "bold");

    layersLegends
        .exit()
        .select(".type")
        .attr("font-weight", "normal");

}