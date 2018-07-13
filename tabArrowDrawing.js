$(window).on("graphDrawn", updateArrows);

function updateArrows() {
    var nodesNeedingArrow = graph.nodesArray.filter(node => {
        console.log(node.childsArr.some(child => node.tab < child.tab));
        return node.childsArr.some(child => node.tab < child.tab);
    });
    console.log(nodesNeedingArrow);

    var lineSize = 2;
    var squareSize = lineSize * 4;

    var selectedNodes = d3.select("#nnblocks")
        .select("svg")
        .selectAll("line")
        .data(nodesNeedingArrow, node => node.id);

    selectedNodes
        .enter()
        .append("line")
        .attr("stroke-width", lineSize)
        .attr("stroke", "#424242")
        .merge(selectedNodes)
        .attr('x1', node => node.xPossition + (settings.tabSize / 2))
        .attr('x2', node => node.xPossition + (settings.tabSize / 2))
        .attr('y1', node => (node.depth + 1) * settings.barHeight)
        .attr('y2', node => getConnectedNode(node).depth * settings.barHeight);

    selectedNodes.enter()
        .append("rect")
        .attr("x", node => node.xPossition + (settings.tabSize / 2) - (squareSize / 2))
        .attr("y", node => (node.depth + 1) * settings.barHeight)
        .attr("width", squareSize)
        .attr("height", settings.barHeight / 2)
        .attr("fill", node => getConnectedNode(node).color);

    selectedNodes.enter()
        .append("rect")
        .attr("width", squareSize)
        .attr("height", settings.barHeight / 2)
        .attr("x", node => node.xPossition + (settings.tabSize / 2) - (squareSize / 2))
        .attr("y", node => (getConnectedNode(node).depth - 0.5) * settings.barHeight)
        .attr("fill", node => node.color);
}

function getConnectedNode(node) {
    return node.childsArr.filter(child => child.tab === node.tab)[0];
}