

function getdata(graph){

    console.log("my script is working!");
    console.log("grap data is:",graph);

    var name = [];
    var depthArr = [];
    var siblingArr = [];
    var order = [];
    graph["nodes"].forEach(function (item,index,array) {

        depthArr.push(item["depth"]);
        siblingArr.push(item["siblingsNum"]);
        name.push(item["id"]);
        order.push(item["order"]);

    })
    console.log(name);
    console.log(depthArr);
    console.log(siblingArr);
    console.log(order);

    drawRectangle(depthArr,name,siblingArr)

}




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

                var indexes = getAllIndexes(depthArr, d);

                if(indexes.length > 1){

                    console.log("my length is", indexes.length);
                    console.log("out of my siblings i am: ",indexes.indexOf(i));
                    return xpos + 201*indexes.indexOf(i);
                }



            })
            .attr("y", function(d,i){

                return d*(barthinkness+gap)})
            .attr("width", barwidth)
            .attr("height", barthinkness)
            .attr("fill", "teal");


        var label = svg.selectAll("text")
            .data(depthArr)
            .enter()
            .append("text")
            .style("fill", "black")
            .attr("x", function (d,i) {

                var indexes = getAllIndexes(depthArr, d);
                //console.log("find all indexes of ",indexes);
                if(indexes.length > 1){

                    console.log("my length is", indexes.length);
                    console.log("out of my siblings i am: ",indexes.indexOf(i));
                    return 100 + 200*indexes.indexOf(i);
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
function siblings(data){


    depthCheckArr.push(data);


    return countInArray(depthCheckArr, data)
}


function countInArray(array, what) {
    var count = -1;
    var newcount=0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }


    return count;
}


function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

