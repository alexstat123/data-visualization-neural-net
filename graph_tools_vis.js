var legendItem = null;

$(window).on("load", setup);
$(window).on("graphLoaded", (event, graph) => drawTools(graph));

$(window).on("graphDrawn", () => {
    var box = d3.select("#nnblocks>svg").node().getBBox();
    d3.select("#nnblocks>svg").attr("width", box.width).attr("height", box.height);
});

function setup() {
    legendItem = d3.select(".legendItem").remove().node();
}

function drawTools(graph) {

    var layersLegends = d3.select("#layersLegend");
    var legendsBind = layersLegends
        .selectAll(".legendItem")
        .data(graph.getLayersColors());

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

    var box = layersLegends.node().getBBox();
    layersLegends.attr("height", box.height);
}


