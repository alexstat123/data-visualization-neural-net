//onsole.log("semantic zoom script is working!");

// var label2 = svg.selectAll("text")
//     .data(graph.nodesArray,node => node.depth)
//
// label2
//     .enter()
//     .append("text")
//     .merge(label2)
//     .style("fill", "black")
//     .attr("x", function (d)
//     {
//         // x position of bar + half width of bar + tab val*variable
//         //width(d);
//         console.log("width",d.width - settings.gapSize);
//         return d.xPossition + (d.width - gap)/2 + (d.isMainBranch? 0 : settings.rootWidth+settings.tabSize)
//
//
//     })
//     .attr("y", function (d) {
//
//         return d.depth * (barthinkness)
//
//
//     })
//     .attr("dy", ".75em")
//     .attr("text-anchor", "middle")
//     .text(function (d)
//     {
//         return d.id;
//     })
//     .style("font-size", function(d)
//     {
//         //console.log("barthikness",barthinkness);
//         //return (16 - d.siblingsNum + barthinkness/7);
//         if((d.width - settings.gapSize) <44){
//             return (d.width - settings.gapSize - 30)  ;
//         }
//         if(barthinkness > 6){
//             return (10 - d.siblingsNum + barthinkness/7);
//         }else{
//
//             return ( d.siblingsNum + barthinkness/7);
//         }
//
//
//
//     });
//
//
//
// label.exit().remove();