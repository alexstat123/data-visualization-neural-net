$(window).on("graphLoaded", (event, data) => getdata(data));
$(window).on("changedSettings", (event, data) => drawRectangle(null, null, null));


var siblingArr = [];
var gap = settings.gapSize;

function getdata(graph) {

    console.log("my script is working  well!");
    console.log("graph",graph);

    var name = [];
    var depthArr = [];
    var order = [];
    var tabs = [];
    graph["nodesArray"].forEach(function (item, index, array) {

        depthArr.push(item["depth"]);
        siblingArr.push(item["siblingsNum"]);
        name.push(item["id"]);
        order.push(item["order"]);
        tabs.push(item["tab"]);

    })

    drawRectangle(depthArr, name, siblingArr);
    $(window).trigger("graphDrawn");
}


function drawRectangle(depthArr, name, siblingsArr) {


    //var gap = 1;
    var barthinkness = settings.barHeight;
    // var barwidth = 200;
    // var xpos = 0;

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
            // x position of bar + tab val*variable
            //console.log("i am",d.id);
            //console.log("my tab",d.tab);
            //console.log("my order",d.order);

            //return dimetionParameter[1] + d.tab * 30
            return dimetionParameter[1] + (d.isMainBranch? 0 : settings.rootWidth+settings.tabSize);

        })
        .attr("y", function (d, i) {

            return d["depth"] * (barthinkness)
        })
        .attr("width", function (d)
        {

            // var indexes = getAllIndexes(depthArr, d.depth);
            // console.log("indexes",indexes);

            dimetionParameter =width(d);
            return dimetionParameter[0]- gap;
            //return dimetionParameter[0]- gap;
        })
        .attr("height", function(d){
            dimetionParameter =width(d);
            return dimetionParameter[2] * barthinkness
        })
        .attr("fill", function(d)
        {

            return d.color
        });




    var label = svg.selectAll("text")
        .data(graph.nodesArray,node => node.id)
        .enter()
        .append("text")
        .style("fill", "black")
        .attr("x", function (d)
        {
            // x position of bar + half width of bar + tab val*variable
            return d.xPossition + d.width/2

        })
        .attr("y", function (d) {

            return d.depth * (barthinkness) // d.depth * (barthinkness + gap) was here
        })
        .attr("dy", ".75em")
        .attr("text-anchor", "middle")
        .text(function (d)
        {
            return d.id;
        })
        .style("font-size", function(d)
        {
            var indexes = d.siblingsNum
            return 16 - indexes.length
        });

}

depthCheckArr = [];

function getAllIndexes(arr, val)
{

    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1)
    {
        indexes.push(i);
    }

    return indexes;
}




function width(node){

    // if I dont have parents
    if(node.parents.size === 0){

        // width
        node.width = settings.rootWidth;


        // x possition
        //node.xPossition = 0 +node.tab *30;
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
            //widthsum += key.width - key.tab * 10;

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

