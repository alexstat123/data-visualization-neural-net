var legendItem = null;
var selectedNodes = [];

$(window).on("load", setup);
$(window).on("graphLoaded", (event, graph) => drawTools(graph));

$(window).on("graphDrawn", () => {
    var box = d3.select("#nnblocks>svg").node().getBBox();
    d3.select("#nnblocks>svg").attr("width", box.width).attr("height", box.height);

    nodeClickSetup()
});

function setup() {
    legendItem = d3.select(".legendItem").remove().node();
    setupKeyboard();
}

function setupKeyboard() {
    d3.select("body")
        .on("keydown", () => {
            if (d3.event.keyCode === 16) {
                isSHIFTpressed = true;
            }
            else if (d3.event.keyCode == 17) {
                isCTRLpressed = true;
            }
        }).on("keyup", () => {
        if (d3.event.keyCode === 16) {
            isSHIFTpressed = false;
        }
        else if (d3.event.keyCode == 17) {
            isCTRLpressed = false;
        }
    });
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


function updateSelection() {
    d3.select("#nnblocks")
        .selectAll("rect")
        .data(selectedNodes, node => node.id)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .exit()
        .attr("stroke-width", "0");
}

var isCTRLpressed = false;
var isSHIFTpressed = false;

function nodeClickSetup() {

    d3.select("#nnblocks")
        .selectAll("rect")
        .data(graph.nodesArray)
        .on("click", d => {
            if (isCTRLpressed) {
                selectedNodes.push(d);
            }
            else if (isSHIFTpressed) {
                selectedNodes.push(d);

                if (selectedNodes.length === 2) {
                    var start = selectedNodes[0];
                    var end = selectedNodes[1];

                    if (end.depth < start.depth) {
                        var tmp = end;
                        end = start;
                        start = tmp;
                    }
                    graph.nodesArray.forEach((node) => {
                        if (node.depth > start.depth && node.depth < end.depth) {
                            selectedNodes.push(node);
                        }
                    });
                }
            }
            else {
                selectedNodes = [d];
            }

            updateSelection();
        });
}

