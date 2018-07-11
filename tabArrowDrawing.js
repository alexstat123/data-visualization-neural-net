$(window).on("graphDrawn", updateArrows);

function updateArrows() {
    var nodesNeedingArrow = graph.nodesArray.filter(node => {
        [...node.childs.values()].some(child => node.tab - child.tab < 0);
    });

    var lineGen=
    d3.select("#nnblocks")
        .selectAll("line")
        .data(nodesNeedingArrow, node => node.id)
        .enter()
        .append("line")

}