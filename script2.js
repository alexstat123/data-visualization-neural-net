$(window).on("graphLoaded", (event, data) => getdata(data));
$(window).on("changedSettings", (event, data) => drawRectangle(null, null, null));


//var gap = settings.gapSize;
//var gap = 20;

function getdata(graph) {

    console.log("script is working very well!");
    console.log("graph", graph);


    drawRectangle();
    $(window).trigger("graphDrawn");
}


function drawRectangle() {

    var barthinkness = settings.barHeight;
    var gap = settings.gapSize;

    var svg = d3
        .select("#nnblocks")
        .selectAll("#svg_NNContainer")
        .data([graph], graph => graph.netId);

    svg.exit().remove();

    svg = svg.enter()
        .append("svg")
        .attr("id", "svg_NNContainer")
        .attr("width", 1000)
        .attr("height", 1800)
        .merge(svg);

    var rects = svg.selectAll(".svg_layer") // ".svg_layer"
        .data(graph.nodesArray, node => node.id);

    rects
        .enter()
        .append("rect")
        .attr("class", "svg_layer")
        .merge(rects)
        .attr("x", function (d) {
            width(d);
            //console.log("data",d);
            return d.xPossition + (d.isMainBranch ? 0 : settings.rootWidth + settings.tabSize);
            //return d.xPossition
        })
        .attr("y", function (d) {

            return d["depth"] * (barthinkness)
        })
        .attr("width", function (d) {


            return d.width - gap;

        })
        .attr("height", function (d) {

            return d.height * barthinkness
        })
        .attr("fill", function (d) {
            return d.color
        })
        .on("mouseover", function (d) {


            var xPosition = parseFloat(d3.select(this).attr("x")) + 700;
            var yPosition = parseFloat(d3.select(this).attr("y"));


            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .html("Name: " + d.id + '<br/>' + "Layer Type: " + d.originalData.layerType + '<br/>'
                    + "Kernel: " + d.originalData.config.kernel + '<br/>' + "Convolution Dim: " + d.originalData.config.convolutionDim);


            //console.log("data",d.originalData);
            //console.log("layer type",d.originalData.layerType);
            //console.log("config",d.originalData.config);
            //console.log("kernel",d.originalData.config.kernel);

            d3.select("#tooltip").style("opacity", 1)

        })
        .on("mouseout", function (d) {

            //d3.select("#tooltip").remove();
            d3.select("#tooltip").style("opacity", 0)
        })
        .on("mousemove", function (d) {

            //d3.select("#tooltip").classed("hidden", true)

        })


    var label = svg.selectAll("text")
        .data(graph.nodesArray, node => node.id)

    label
        .enter()
        .append("text")

        .merge(label)
        .style("fill", "black")
        .attr("x", function (d) {
            // x position of bar + half width of bar + tab val*variable
            //width(d);
            //console.log("width",d.width - settings.gapSize);
            return d.xPossition + (d.width - gap) / 2 + (d.isMainBranch ? 0 : settings.rootWidth + settings.tabSize)


        })
        .attr("y", function (d) {

            return d.depth * (barthinkness)


        })
        .attr("dy", ".75em")
        .attr("text-anchor", "middle")
        .text(function (d) {
            // return d.id;
            return semanticZoom(d);
        })
        //.append("tspan").text(function(d){return d.order})

        .style("font-size", function (d) {
            //console.log("barthikness",barthinkness);
            //return (16 - d.siblingsNum + barthinkness/7);
            if ((d.width - settings.gapSize) < 44) {
                return (d.width - settings.gapSize - 30);
            }
            if (barthinkness > 6) {
                return (10 - d.siblingsNum + barthinkness / 7);
            } else {

                return (d.siblingsNum + barthinkness / 7);
            }


        });

    var tspans = label.selectAll("tspan")
        .data(d => {
            //console.log(Object.keys(d.originalData.config|| {}).map(key => ({k: key, v: d.originalData.config[key]})));

            return Object.keys(d.originalData.config|| {}).map(key => ({k: key, v: d.originalData.config[key], node:d}));
        },d => d.k);
    tspans
        .enter()
        .append("tspan")
        .merge(tspans)
        .attr("dy", function (d,j) {

            var gapFromBottomEdge = (0.1+ 0.2*j)* barthinkness;
            //console.log("text bbox y pos", this.getBBox().y)
            //var gapFromBottomEdge = 0.4 * barthinkness + j * 10;
            //console.log("gapFromBottomEdge",gapFromBottomEdge);
            //return d.depth * (barthinkness) + gapFromBottomEdge;
            //return  d.node.depth * (barthinkness) + gapFromBottomEdge;
            return 10;

        })
        .attr("x", function (d) {

            //return d.xPossition + (d.width - gap) / 2 + (d.isMainBranch ? 0 : settings.rootWidth + settings.tabSize)
            return d.node.xPossition + (d.node.width - gap) / 2 + (d.node.isMainBranch ? 0 : settings.rootWidth + settings.tabSize);

        })
        .style("font-size", function (d) {
            return 12
        })
        .text(function (d, val) {

            var textInNode = d.k + ": " + d.v;

             //console.log("d.k",textInNode);
            // console.log("bbox",this.getBBox().width)
            //console.log("barthikness",barthinkness);

            //console.log("text length",label.node().getComputedTextLength());
            return textInNode

        })
        .text(function (d, val) {
            //only return definded keys and values, do not return non defined
            //key and values.

            //console.log();
            // condition for drawing the text
            //console.log("this", this)

            //console.log("rects bbox", rects.node().getBBox())

            //console.log("node width", d.node.width)
            //console.log("text",d.k + ": " + d.v)

            //console.log("text length",this.getComputedTextLength())
            if (this.getComputedTextLength() < d.node.width) {

                var textInNode = d.k + ": " + d.v;

                if(this.getBBox().height < rects.node().getBBox().height){

                    return textInNode
                }


            }


        });



    // var j;
    //     // for(j = 0; j < 10; j++) {
    //     //     label.append("tspan")
    //     //         .text(function(d){
    //     //
    //     //             var textInNode =  Object.keys(d.originalData.config || [])[j] + ": " + Object.values(d.originalData.config || [])[j];
    //     //
    //     //             // console.log("this",this);
    //     //             // console.log("bbox",this.getBBox().width)
    //     //             //console.log("barthikness",barthinkness);
    //     //
    //     //             //console.log("text length",label.node().getComputedTextLength());
    //     //             return textInNode
    //     //
    //     //         })
    //     //         .text(function (d, i) {
    //     //             //only return definded keys and values, do not return non defined
    //     //             //key and values.
    //     //             if(Object.keys(d.originalData.config || [])[j] !== undefined){
    //     //
    //     //                 // condition for drawing the text
    //     //                 if(this.getBBox().width < d.width ){
    //     //
    //     //                     var textInNode =  Object.keys(d.originalData.config || [])[j] + ": " + Object.values(d.originalData.config || [])[j];
    //     //
    //     //                     console.log("this",this);
    //     //                     console.log("bbox",this.getBBox().width)
    //     //                     //console.log("barthikness",barthinkness);
    //     //
    //     //                     //console.log("text length",label.node().getComputedTextLength());
    //     //                     return textInNode
    //     //
    //     //                 }
    //     //
    //     //             }
    //     //
    //     //         })
    //     //         .attr("y", function (d) {
    //     //
    //     //             //var gapFromBottomEdge = (0.1+ 0.2*j)* barthinkness;
    //     //             var gapFromBottomEdge = 0.4 * barthinkness + j*10;
    //     //             //console.log("gapFromBottomEdge",gapFromBottomEdge);
    //     //             return d.depth * (barthinkness) + gapFromBottomEdge;
    //     //
    //     //         })
    //     //         .attr("x", function (d) {
    //     //
    //     //             return d.xPossition + (d.width - gap) / 2 + (d.isMainBranch ? 0 : settings.rootWidth + settings.tabSize)
    //     //
    //     //         })
    //     //         .style("font-size", function (d) {
    //     //             return 12
    //     //         });
    //     // }


    rects.exit().remove();
    label.exit().remove();


    var tooltip = svg.append("g")
        .attr("class", tooltip)
        .style("display", "none");

    tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("font-size", "1em")
        .style("fill", "blue")
        .style("stroke", "red")
        .style("Opacity", "0.7")


        .attr("font-weight", "bold");
}


function width(node) {

    // if I dont have parents
    if (node.parents.size === 0) {

        // width
        node.width = settings.rootWidth;


        // x possition
        node.xPossition = 0;
        nodeWidthAndPosX = [node.width, node.xPossition, node.height];
        return nodeWidthAndPosX
    }

    // if I have one parent
    if (node.parents.size >= 1) {

        //width
        widthsum = 0;
        //sum all parents witdths
        Array.from(node.parents.values()).filter(parent => parent.tab <= node.tab).forEach((key, value) => {
            widthsum += key.width;

        });

        // x position
        parentXpos = 0;
        //node.parents.forEach((key,value) => {parentXpos = key.xPossition + key.tab * 30})     // difference of tabs needs to be added
        parent = Array.from(node.parents.values()).sort((a, b) => a.xPossition - b.xPossition)[0];
        node.width = ((widthsum - (node.tab - parent.tab) * settings.tabSize) / node.siblingsNum);


        //node.xPossition = parentXpos + node.width * node.order + node.tab *30;
        node.xPossition = parent.xPossition + node.width * node.order + (node.tab - parent.tab) * settings.tabSize;     // difference of tabs needs to be added

        //console.log("node.xposition", parent.tab);
        nodeWidthAndPosX = [node.width, node.xPossition, node.height];

        return nodeWidthAndPosX
    }

}

function plusZoom() {

    console.log("plus zoom pressed!");


    $("#slider_LayerWidth").val(parseInt($("#slider_LayerWidth").val()) + 30);
    $("#slider_LayerWidth").trigger('change');

    $("#slider_LayerHeight").val(parseInt($("#slider_LayerHeight").val()) + 30);
    $("#slider_LayerHeight").trigger('change');

}

function minusZoom() {

    console.log("minus zoom pressed!");

    $("#slider_LayerWidth").val(parseInt($("#slider_LayerWidth").val()) - 30);
    $("#slider_LayerWidth").trigger('change');

    $("#slider_LayerHeight").val(parseInt($("#slider_LayerHeight").val()) - 30);
    $("#slider_LayerHeight").trigger('change');
}

function semanticZoom(d) {

    if (d.originalData.config != undefined) {

    }

    return d.id


}

