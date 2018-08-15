$(window).on("graphDrawn", updateExitArrows);




function updateExitArrows(){


    var nodesArr = graph.nodesArray;
    var nodesNeedingArrow = nodesArr.filter(function(node){

        return node.childsArr.some(child => child.isMainBranch == false && node.isMainBranch == true)

    })

    var nodesConnectingTO = nodesArr.filter(function(node){

        //return node.childsArr.some(child =>child.isMainBranch == false)
        return node.isMainBranch == false && node.parentsArr.some(par => par.isMainBranch == true)

    })

    console.log("branch info",nodesNeedingArrow);
    console.log("branch connected to", nodesConnectingTO);


    var lineSize = 2;

    var selectedNodes = d3.select("#svg_NNContainer")
        .selectAll(".connection2")
        .data(nodesNeedingArrow, node => node.id);

    selectedNodes.exit().remove();

    var connections = selectedNodes
        .enter()
        .append("g")
        .classed("connection2", true);

    connections
        .append("line")
        .attr("stroke-width", lineSize)
        .attr("stroke", "#424242")
        .merge(selectedNodes.select('line'))
        .attr('x1', node => {
            //console.log("some node info",(node.depth + 1) * settings.barHeight);
            console.log("node.id",node)
            return node.xPossition  + node.width
        })
        .attr('x2', node => node.xPossition + (settings.tabSize / 2)+node.width * 1.5)
        .attr('y1', node => (node.depth + 0.5 ) * settings.barHeight)
        .attr('y2', node => (node.depth + 0.5 ) * settings.barHeight);



    var lineSize = 2;

    var selectedNodes2 = d3.select("#svg_NNContainer")
        .selectAll(".connection10")
        .data(nodesNeedingArrow, node => node.id);

    selectedNodes2.exit().remove();

    var connections2 = selectedNodes2
        .enter()
        .append("g")
        .classed("connection10", true);

    connections2
        .append("line")
        .attr("stroke-width", lineSize)
        .attr("stroke", "#424242")
        .merge(selectedNodes2.select('line'))
        .attr('x1', node => {
            //console.log("some node info",(node.depth + 1) * settings.barHeight);
            console.log("node.id",node)
            return node.xPossition + (settings.tabSize / 2)+node.width * 1.5
        })
        .attr('x2', node => node.xPossition + (settings.tabSize / 2)+node.width * 1.5)
        .attr('y1', node => (node.depth + 0.5 ) * settings.barHeight)
        .attr('y2', node => (node.depth + 0.5 ) * settings.barHeight + settings.barHeight * 0.5);


}