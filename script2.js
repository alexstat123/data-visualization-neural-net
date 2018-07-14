$(window).on("graphLoaded", (event, data) => getdata(data));
$(window).on("changedSettings", (event, data) => drawRectangle(null, null, null));



var gap = settings.gapSize;

function getdata(graph) {

    console.log("script is working!");
    console.log("graph",graph);


    drawRectangle();
    $(window).trigger("graphDrawn");
}


function drawRectangle() {

    var barthinkness = settings.barHeight;


    var svg = d3
        .select("#container_neuralNetwork")
        .selectAll("#svg_NNContainer")
        .data([graph], graph=>graph.netId);

    svg.exit().remove();

    svg = svg.enter()
        .append("svg")
        .attr("id", "svg_NNContainer")
        .attr("width", 1000)
        .attr("height", 1800)
        .merge(svg);

    var rects = svg.selectAll(".svg_layer")
        .data(graph.nodesArray, node => node.id);

    rects
        .enter()
        .append("rect")
        .attr("class","svg_layer")
        .merge(rects)
        .attr("x", function (d)
        {
            dimetionParameter =width(d);
            return d.xPossition + (d.isMainBranch? 0 : settings.rootWidth+settings.tabSize);

        })
        .attr("y", function (d) {

            return d["depth"] * (barthinkness)
        })
        .attr("width", function (d)
        {
            dimetionParameter =width(d);
            return d.width- gap;

        })
        .attr("height", function(d){
            dimetionParameter =width(d);
            return d.height * barthinkness
        })
        .attr("fill", function(d){return d.color})
        .on("mouseover",function(d){
            tooltip.style("display",null);
            console.log(d.id)
        })
        .on("mouseout",function(d){
            tooltip.style("display","none");
        })
        .on("mousemove",function(d){
            var xPos = d3.mouse(this)[0] - 15;
            var yPos = d3.mouse(this)[1] - 55;
            tooltip.attr("transform","translate(" + xPos +","+yPos+")");
            tooltip.select("text").text(d.id);
        })

    var tooltip = svg.append("g")
                     .attr("class",tooltip)
                     .style("display","none");

    tooltip.append("text")
        .attr("x",15)
        .attr("dy","1.2em")
        .style("font-size","1.2em")
        .attr("font-weight","bold");


    var label = svg.selectAll("text")
        .data(graph.nodesArray,node => node.id)

    label
        .enter()
        .append("text")
        .style("fill", "black")
        .attr("x", function (d)
        {
            // x position of bar + half width of bar + tab val*variable
            return d.xPossition + d.width/2

        })
        .attr("y", function (d) {

            return d.depth * (barthinkness)
        })
        .attr("dy", ".75em")
        .attr("text-anchor", "middle")
        .text(function (d)
        {
            return d.id;
        })
        .style("font-size", function(d)
        {
            return 16 - d.siblingsNum;
        });

    rects.exit().remove();
    label.exit().remove();
}


function width(node){

    // if I dont have parents
    if(node.parents.size === 0){

        // width
        node.width = settings.rootWidth;


        // x possition
        node.xPossition = 0;
        nodeWidthAndPosX = [node.width,node.xPossition,node.height];
        return nodeWidthAndPosX
    }

    // if I have one parent
    if(node.parents.size >= 1){

        //width
        widthsum = 0;
        //sum all parents witdths
        Array.from(node.parents.values()).filter(parent=>parent.tab<=node.tab).forEach((key,value) => {
            widthsum += key.width;

        });

        // x position
        parentXpos = 0;
        //node.parents.forEach((key,value) => {parentXpos = key.xPossition + key.tab * 30})     // difference of tabs needs to be added
        parent = Array.from(node.parents.values()).sort((a,b) => a.xPossition - b.xPossition)[0];
        node.width = ((widthsum - (node.tab - parent.tab) * settings.tabSize )/ node.siblingsNum);

        //node.xPossition = parentXpos + node.width * node.order + node.tab *30;
        node.xPossition = parent.xPossition + node.width * node.order + (node.tab - parent.tab) * settings.tabSize ;     // difference of tabs needs to be added

        console.log("node.xposition", parent.tab);
        nodeWidthAndPosX = [node.width,node.xPossition,node.height];

        console.log("i am",node.id);
        console.log("next guy is",node.parents.values().next().value);
        return nodeWidthAndPosX
    }

}

