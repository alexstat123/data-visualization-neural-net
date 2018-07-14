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
        .merge(legendsBind)
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
        .data(graph.nodesArray.map(node => node.selected ? node.type : {'type': ''}), type => type.type);

    layersLegends.select(".type")
        .attr("font-weight", "bold");

    layersLegends
        .exit()
        .select(".type")
        .attr("font-weight", "normal");

}