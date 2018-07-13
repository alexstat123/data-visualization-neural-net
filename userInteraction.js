$(window).on("graphDrawn", () => {
    var box = d3.select("#nnblocks>svg").node().getBBox();
    d3.select("#nnblocks>svg").attr("width", box.width).attr("height", box.height);
    console.log("init");
    nodeClickSetup()
});

$(window).on("load", () => setupFileLoader());
$(window).on("load", () => setupCollapseClicks());

function setupCollapseClicks() {
    $("#toggle_expandNeuralNetwork, #toggle_resizeNeuralNetwork").on("click", () => {
        $("#centralContainer").toggleClass("col-xl-12 order-first");
        $("#toggle_expandNeuralNetwork, #toggle_resizeNeuralNetwork").toggleClass('d-none');
    });
}

function setupFileLoader() {
    $('#nn_file').on("change", function (event) {
        d3.select("#nnblocks")
            .select('svg')
            .remove();

        var reader = new FileReader();
        reader.onload = function (e) {
            createGraph(JSON.parse(e.target.result));
        };

        reader.readAsText(event.target.files[0]);
    });
}

function nodeClickSetup() {

    d3.select("#nnblocks")
        .selectAll("rect")
        .data(graph.nodesArray, node => node.id)
        .on("click", d => clickEvent(d));

    d3.select("#nnblocks")
        .selectAll("text")
        .data(graph.nodesArray, node => node.id)
        .on("click", d => clickEvent(d));
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