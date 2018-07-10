var legendItem = null;
$(window).on("load", setup);
$(window).on("graphLoaded", (event, graph) => drawLegend(graph));
$(window).on("nodesSelectionChanged", () => updateSelection());

function setup() {
    legendItem = d3.select(".legendItem").remove().node();
}

function drawLegend(graph) {

    var layersLegends = d3.select("#layersLegend");
    var legendsBind = layersLegends
        .selectAll(".legendItem")
        .data(graph.getLayersColors(), type => type.type);

    var lineHeight = 30;
    var items = legendsBind
        .enter()
        .append(() => {
            return legendItem.cloneNode(true);
        })
        .attr("x", 0)
        .attr("y", (d, i) => lineHeight * i);

    items.select(".type")
        .text(layer => layer.type);
    items.select(".square")
        .attr("fill", layer => layer.color);

    legendsBind.exit().remove();

    var box = layersLegends.node().getBBox();
    layersLegends.attr("height", box.height);
}

function updateSelection() {
    d3.select("#nnblocks")
        .selectAll("rect")
        .data(graph.nodesArray, node => node.id)
        .attr("stroke", "#000000")
        .attr("stroke-width", node => node.selected ? "1px" : "0");

    var layersLegends = d3.select("#layersLegend")
        .selectAll(".legendItem")
        .data(graph.nodesArray.map(node => node.selected ? node.type : {'type': ''}), type => type.type);

    layersLegends.select(".type")
        .attr("font-weight", "bold");

    layersLegends
        .exit()
        .select(".type")
        .attr("font-weight", "normal");

}