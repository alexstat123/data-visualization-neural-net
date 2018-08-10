$(window).on("graphDrawn", () => eventHalnder());
$(window).on("load", () => setupFileLoader());
$(window).on("load", () => setupCollapseClicks());
$(window).on("nodesSelectionChanged", (event, selection) => selectionOpacity(selection));
$(window).on("opacityOverride", (event, selection) => selectionOpacity(selection));

function eventHalnder() {
    var box = d3.select("#svg_NNContainer").node().getBBox();
    d3.select("#svg_NNContainer").attr("width", box.width).attr("height", box.height);
    nodeClickSetup();
    nodesHoverSetup();
}

function setupCollapseClicks() {
    $("#toggle_expandNeuralNetwork, #toggle_resizeNeuralNetwork").on("click", () => {
        $("#centralContainer").toggleClass("col-xl-12 order-first");
        $("#toggle_expandNeuralNetwork, #toggle_resizeNeuralNetwork").toggleClass('d-none');
    });

    $("#toggle_expandInfo, #toggle_resizeInfo").on("click", () => {
        $("#container_LeftSidebar").toggleClass("col-xl-12 order-1");
        $("#toggle_expandInfo, #toggle_resizeInfo").toggleClass('d-none');
    });
}

function setupFileLoader() {
    $('#nn_file').on("change", function (event) {

        var reader = new FileReader();
        reader.onload = function (e) {
            createGraph(JSON.parse(e.target.result));
        };

        reader.readAsText(event.target.files[0]);
    });
}

function nodeClickSetup() {

    d3.select("#svg_NNContainer")
        .selectAll(".svg_layer")
        .on("click", d => clickEvent(d));

    d3.select("#svg_NNContainer")
        .selectAll("text")
        .on("click", d => clickEvent(d));
}

function nodesHoverSetup() {
    d3
        .selectAll(".svg_layer")
        .on("mouseenter", node => {
            if (!node.selected) {
                return;
            }
            $(window).trigger("mouseOverNode", node);
        }).on("mouseleave", node => {
        if (!node.selected) {
            return;
        }
        $(window).trigger("mouseOutNode", node);
    });

}

function clickEvent(d) {
    if (d3.event.ctrlKey) {
        d.selected = !d.selected;
    }
    else if (d3.event.shiftKey) {
        d.selected = true;

        var selectedNodes = graph.nodesArray.filter(node => node.selected);
        if (selectedNodes.length === 2) {
            graph.deselectAllNodes();
            var start = selectedNodes[0];
            var end = selectedNodes[1];

            var nodesBetween = graph.getAllPathsBetween(start, end);
            nodesBetween.forEach(node => node.selected = true);
        }
    }
    else {
        graph.deselectAllNodes();
        d.selected = true;
    }
    $(window).trigger("nodesSelectionChanged", [graph.getSelectedNodes()]);
}

function selectionOpacity(newSelection) {
    console.log(newSelection);
    var nodes = d3
        .select("#nnblocks")
        .selectAll(".svg_layer");

    if (!newSelection || newSelection.length === 0) {
        newSelection = graph.getSelectedNodes();
    }

    var bindNodes = null;
    if (newSelection.length === 0) {
        bindNodes = nodes
            .data(graph.nodesArray, node => node.id);
    } else {
        bindNodes = nodes
            .data(newSelection, node => node.id);
    }

    bindNodes
        .transition(1000)
        .attr("opacity", 1);

    bindNodes
        .exit()
        .transition(1000)
        .attr("opacity", 0.3);
}