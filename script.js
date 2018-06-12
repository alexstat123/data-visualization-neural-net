// Load CSV file

//Graph object
graph = {
    /*
        Node dictionary
        id=>nodeObject
     */
    nodes: {},
    //Given an id, returns the node object
    getNode: function (id) {
        var node = this.nodes[id];
        return node;
    },
    /*
           Given one row of the field layers
           of the json file,
           creates and returns the relative node object
     */
    createNode(nodeData) {
        var id = nodeData.id;

        //If node already there, just return it
        if (this.nodes[id])
            return this.nodes[id];

        //Node object
        var node = {
            id: id,
            originalData: nodeData,
            depth: -1000,
            //Dictionary of nodes connected to this node "on top" part of it
            parents: {},
            //Dictionary of nodes connected to this node "on bottom" part of it.
            childs: {},
            //Add a parent to the dictionary, indexed by id
            addParent: function (parentNode) {
                this.parents[parentNode.id] = parentNode;
            },
            //Add a child to the dictionary, indexed by id
            addChild: function (childNode) {
                this.childs[childNode.id] = childNode;
            },
            //Updates the depth of the current node and all his children
            setDepth: function (newDepth) {
                //depth of this node has to be the maximum of the depth of his parents
                if (this.depth > newDepth)
                    return;

                this.depth = newDepth;
                //For each child set its depth
                for (var key in this.childs) {
                    this.childs[key].setDepth(newDepth + 1);
                }
            }
        };

        //add the created node to the list of nodes of this graph
        this.nodes[id] = node;

        //end of createNode()
        return node;
    },
    addParentChildRel: function (parentId, childId) {

        var parentNode = this.getNode(parentId);
        var childNode = this.getNode(childId);
        //if parent or child are null throw error
        if (!parentNode || !childNode)
            throw "error parent or child not found";

        parentNode.addChild(childNode);
        childNode.addParent(parentNode);
    },
    //Returns the only node without any parents
    getRoot() {
        for (var key in this.nodes) {
            //if the lenght of the parents array of the current node is 0 it is the root
            if (Object.keys(this.nodes[key].parents).length === 0) {
                return this.nodes[key];
            }
        }

        throw "No root found";
    },
    //Set depth of the root, will go down to all the nodes by design
    updateDepth() {
        var root = this.getRoot();
        root.setDepth(0);
    }

};

//Create the graph, input the whole json
function createGraph(neuralNetwork) {
    //foreach layer create the relative node
    neuralNetwork.netLayers.forEach(function (row) {
        graph.createNode(row);
    });
    //Foreach link in links
    neuralNetwork.links.forEach(function (row) {
        row.idsNext.forEach(function (link) {
            //foreach idsNext in the array set idPrev as father of idsNext
            graph.addParentChildRel(row.idPrev, link);
        })
    });

    graph.updateDepth();

    console.log("graph");
    console.log(graph);
}

d3.json("data/AnnaNet/net.json", function (error, json) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    createGraph(json);
    console.log("json");
    console.log(json);
});
