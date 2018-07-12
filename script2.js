$(window).on("graphLoaded", (event, data) => getdata(data));


var siblingArr = [];
var gap = 2;

function getdata(graph) {

    console.log("my script is working well !");
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
    var barthinkness = 20;
    var barwidth = 200;
    var xpos = 0;

    var svg = d3.select("#nnblocks")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 1800);


    var rects = svg.selectAll("foo")
        .data(graph.nodesArray, node => node.id)
        .enter()
        .append("rect")
        .attr("x", function (d)
        {

            dimetionParameter =width(d);
            // x position of bar + tab val*variable
            return dimetionParameter[1] + d.tab * 30

        })
        .attr("y", function (d, i) {

            return d["depth"] * (barthinkness)
        })
        .attr("width", function (d)
        {

            var indexes = getAllIndexes(depthArr, d.depth);

            dimetionParameter =width(d);
            return dimetionParameter[0]- gap;
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
            return d.xPossition + d.width/2 + d.tab * 30

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
            var indexes = getAllIndexes(depthArr, d.depth);
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
        node.width = 200;


        // x possition
        //node.xPossition = 0 +node.tab *30;
        node.xPossition = 0;
        nodeWidthAndPosX = [node.width,node.xPossition,node.height];
        return nodeWidthAndPosX
    }

    // if I have one parent
    if(node.parents.size === 1){

        //width
        widthsum = 0;
        //sum all parents witdths
        node.parents.forEach((key,value) => {
            widthsum += key.width;

        });
        node.width = widthsum / node.siblingsNum;


        // x position
        parentXpos = 0;
        node.parents.forEach((key,value) => {parentXpos = key.xPossition})
        //node.xPossition = parentXpos + node.width * node.order + node.tab *30;
        node.xPossition = parentXpos + node.width * node.order;
        nodeWidthAndPosX = [node.width,node.xPossition,node.height];
        return nodeWidthAndPosX
    }

    // if i have more than 1 parent
    if(node.parents.size > 1){

        //width
        widthsum = 0;

        //look at each parent of the current node
        node.parents.forEach((key,value) => {

            // array to store tab values of parents
            tabsArr = [];

            // check if all tab values of parents are the same or not
            node.parents.forEach((key,value) => {tabsArr.push(key.tab)});
            truth =tabsArr.reduce(function(a, b){ return (a === b) ? a : NaN; });


            // if parents have tab value higher me, the sum of their widths is my width
            // returns 0 if all equal and NaN if not all equal
            if(key.tab > node.tab){
                widthsum += key.width;
            }


            // if all of the parents have same tab value and is equal to my tab value, my width
            // is equal to their combined width
            if(key.tab === node.tab && truth === 0){
                widthsum += key.width;
            }

        });


        node.width = widthsum / node.siblingsNum;

        //node.xPossition = 0 +node.tab *30;
        node.xPossition = 0;
        nodeWidthAndPosX = [node.width,node.xPossition,node.height];

        return nodeWidthAndPosX
    }


}

