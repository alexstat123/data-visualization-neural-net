

function getdata(graph){

    console.log("my script is working well!");
    console.log("grap data is:",graph);

    var name = [];
    var depthArr = [];
    var siblingArr = [];
    var order = [];
    var tabs = [];
    graph["nodes"].forEach(function (item,index,array) {

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

    drawRectangle(depthArr,name,siblingArr)

}



// function that draws bars and text on the canvas

function drawRectangle(depthArr,name,siblingsArr)
{


    var gap = 1;
    var barthinkness = 20;
    var barwidth = 200;
    var xpos = 0;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 1800);



        var rects = svg.selectAll("foo")
            .data(depthArr)
            .enter()
            .append("rect")
            .attr("x", function(d,i)
            {

                // number of siblings on ith layer
                var indexes = getAllIndexes(depthArr, d);

                // if number of sibling on ith layer is bigger than 1
                // return width of bar equal to barwidth devided by number of children

                if(indexes.length > 1){


                    return  ((barwidth/indexes.length + gap))*indexes.indexOf(i);

                }



            })
            .attr("y", function(d,i){

                return d*(barthinkness+gap)})
            .attr("width", function (d,i) {

                var indexes = getAllIndexes(depthArr, d);
                console.log("siblings length",indexes.length);
                return barwidth/indexes.length
            })
            .attr("height", barthinkness)
            .attr("fill", "teal");




        // draw text on the canvas

        var label = svg.selectAll("text")
            .data(depthArr)
            .enter()
            .append("text")
            .style("fill", "black")
            .attr("x", function (d,i) {

                var indexes = getAllIndexes(depthArr, d);
                //console.log("find all indexes of ",indexes);
                if(indexes.length > 1){


                    return 50 + 100*indexes.indexOf(i);
                }else{
                    return 100;
                }
            })
            .attr("y", function(d,i){

                return d*(barthinkness+gap)})
            .attr("dy", ".75em")
            .attr("text-anchor", "middle")
            .text(function(d,i){

                //console.log("name",name[i]);
                return name[i];
            });

}

depthCheckArr = [];

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

