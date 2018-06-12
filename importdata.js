

function importData()
{
	//alert("javascript working very well");
	d3.json("AnnaNet/net.json",function(data)
	{
		console.log("AnnaNet/net.json");
		console.log(data);

		// diplay number of layer in the console
		console.log(data.netLayers.length);
	})

	d3.json("AnnaNet/training.json",function(data)
	{
		console.log("training.json");
		console.log(data);
	})

	//Layers JSON files 

	d3.json("AnnaNet/layers/'bn1.json",function(data)
	{
		console.log("'bn1.json");
		console.log(data);
	})
}










function drawRectangle2(number_of_layers)
{
	var gap = 1;
	var barthinkness = 20;
	var barwidth = 200;
	var xpos = 100;

	var svg = d3.select("body")
	.append("svg")
	.attr("width", 400)
	.attr("height", 1800);

	d3.json("AnnaNet/net.json",function(data)
	{
		
		var rects = svg.selectAll("foo")
					.data(data.netLayers)
					.enter()
					.append("rect")
					.attr("x", function(d,i)
						{

							return xpos
						})
					.attr("y", function(d,i){return i*(barthinkness+gap)})
					.attr("width", barwidth)
					.attr("height", barthinkness)
					.attr("fill", "teal");


	     var label = svg.selectAll("text") 
	                .data(data.netLayers)
	                .enter()
	                .append("text")        
    				.style("fill", "black")   
    				.attr("x", 200)           
    				.attr("y", function(d,i){return i*(barthinkness+gap)})           
    				.attr("dy", ".75em")           
    				.attr("text-anchor", "middle") 
    				.text(function(data,i){return data.id});



	})



	
}