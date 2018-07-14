$(window).on("graphDrawn", updateArrows);

function updateArrows() {
    var nodesNeedingArrow = graph.nodesArray.filter(node => {
        return node.childsArr.some(child => node.tab < child.tab);
    });

    var lineSize = 2;
    var squareSize = lineSize * 4;

    var selectedNodes = d3.select("#svg_NNContainer")
        .selectAll(".connection")
        .data(nodesNeedingArrow, node => node.id);

    selectedNodes.exit().remove();

    var connections = selectedNodes
        .enter()
        .append("g")
        .classed("connection", true);

    connections
        .append("line")
        .attr("stroke-width", lineSize)
        .attr("stroke", "#424242")
        .merge(selectedNodes.select('line'))
        .attr('x1', node => {
            console.log((node.depth + 1) * settings.barHeight);
            return node.xPossition + (settings.tabSize / 2)
        })
        .attr('x2', node => node.xPossition + (settings.tabSize / 2))
        .attr('y1', node => (node.depth + 1) * settings.barHeight)
        .attr('y2', node => getConnectedNode(node).depth * settings.barHeight);

    connections
        .append("rect")
        .classed("topConnection", true)
        .merge(selectedNodes.select(".topConnection"))
        .attr("x", node => node.xPossition + (settings.tabSize / 2) - (squareSize / 2))
        .attr("y", node => (node.depth + 1) * settings.barHeight)
        .attr("width", squareSize)
        .attr("height", settings.barHeight / 2)
        .attr("fill", node => getConnectedNode(node).color);

    connections
        .append("rect")
        .classed("bottomConnection", true)
        .merge(selectedNodes.select(".bottomConnection"))
        .attr("width", squareSize)
        .attr("height", settings.barHeight / 2)
        .attr("x", node => node.xPossition + (settings.tabSize / 2) - (squareSize / 2))
        .attr("y", node => (getConnectedNode(node).depth - 0.5) * settings.barHeight)
        .attr("fill", node => node.color);
}

function getConnectedNode(node) {
    return node.childsArr.filter(child => child.tab === node.tab)[0];
}