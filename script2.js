$(window).on("graphLoaded", (event, data) => getdata(data));

function getdata(graph) {

     console.log("my script is working very well yea!");
    // console.log("grap data is:", graph);
     //console.log("values of graph.nodesArray",Object.entries(graph.nodesArray) );

    console.log("color",graph.nodesArray[0]["color"]);

    var name = [];
    var depthArr = [];
    var siblingArr = [];
    var order = [];
    var tabs = [];
    graph["nodesArray"].forEach(function (item, index, array) {

        depthArr.push(item["depth"]);
        siblingArr.push(item["siblingsNum"]);
        name.push(item["id"]);
        order.push(item["order"]);
        tabs.push(item["tab"]);

    })
    console.log(name);
    console.log(depthArr);
    console.log(siblingArr);
    console.log(order);
    console.log(tabs);

    drawRectangle(depthArr, name, siblingArr);
    $(window).trigger("graphDrawn");
}


// function that draws bars and text on the canvas

function drawRectangle(depthArr, name, siblingsArr) {

console.log("depth array!",depthArr);
//console.log("new depth array!",graph.nodesArray[0]["depth"]);
//console.log("graph.nodesArray",graph.nodesArray);

    var gap = 1;
    var barthinkness = 20;
    var barwidth = 200;
    var xpos = 0;

    var svg = d3.select("#nnblocks")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 1800);


    var rects = svg.selectAll("foo")
        .data(graph.nodesArray)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {

            // number of siblings on ith layer
            var indexes = getAllIndexes(depthArr, d.depth);
            //console.log("new depth array!",graph.nodesArray[i]["depth"]);


            // if number of sibling on ith layer is bigger than 1
            // return width of bar equal to barwidth devided by number of children

            if (indexes.length > 1) {


                return ((barwidth / indexes.length + gap)) * indexes.indexOf(i) - gap * (indexes.length - 1);

            }


        })
        .attr("y", function (d, i) {

            return d["depth"] * (barthinkness + gap)
        })
        .attr("width", function (d, i) {

            var indexes = getAllIndexes(depthArr, d.depth);
            //console.log("siblings number",graph.nodesArray[i]["siblingsNum"]);
            console.log("index,length",indexes.length);
            //layerOrder(graph.nodesArray[i]["depth"]);
            //console.log("check length",layerOrder(graph.nodesArray[i]["depth"]));
            //console.log("index length",indexes.length);
            return (barwidth / indexes.length);
        })
        .attr("height", barthinkness)
        .attr("fill", function(d,i){
            console.log("all other colors",graph.nodesArray[i]["color"]);
            return graph.nodesArray[i]["color"]
        });


    // draw text on the canvas

    var label = svg.selectAll("text")
        .data(graph.nodesArray)
        .enter()
        .append("text")
        .style("fill", "black")
        .attr("x", function (d, i) {

            var indexes = getAllIndexes(depthArr, d.depth);
            //console.log("find all indexes of ",indexes);
            if (indexes.length > 1) {

                //console.log("there are this number of siblings", siblingsArr[i]);
                return (barwidth + gap) / (indexes.length * 2) + (barwidth / indexes.length) * indexes.indexOf(i) - gap * (indexes.length - 1);
            } else {
                return 100;
            }
        })
        .attr("y", function (d, i) {

            return d.depth * (barthinkness + gap)
        })
        .attr("dy", ".75em")
        .attr("text-anchor", "middle")
        .text(function (d, i) {

            //console.log("name",name[i]);
            return name[i];
        });

}

depthCheckArr = [];

function getAllIndexes(arr, val) {

    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }

    return indexes;
}

var arr = [];
function layerOrder(myDepth){


    arr.push(myDepth)
    //console.log("my depth is", myDepth);
    //console.log("arr", arr);
    const check = arr.filter(arr => arr == myDepth);
    //console.log("check",check);
    return check.length/2


}

