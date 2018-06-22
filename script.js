// Load CSV file

//Graph object
graph = {
    /*
        Node dictionary
        id=>nodeObject
     */
    nodes: new Map(),
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
        if (this.nodes.has(id))
            return this.nodes.get(id);

        //Node object
        var node = {
            id: id,
            originalData: nodeData,
            //position on the vertical axis
            depth: -1000,
            //how many siblings has the node
            siblingsNum: 0,
            // The order between siblings
            order: 0,
            // Nesting level
            tab: 0,
            // Height of the node
            height: -1,
            //Dictionary of nodes connected to this node "on top" part of it
            parents: new Map(),
            //Dictionary of nodes connected to this node "on bottom" part of it.
            childs: new Map(),
            //Add a parent to the dictionary, indexed by id
            addParent: function (parentNode) {
                this.parents.set(parentNode.id, parentNode);
            },
            //Add a child to the dictionary, indexed by id
            addChild: function (childNode) {
                this.childs.set(childNode.id, childNode);
            },
            //Updates the depth of the current node and all his children
            setDepth: function (newDepth) {
                //depth of this node has to be the maximum of the depth of his parents
                if (this.depth > newDepth)
                    return;

                this.depth = newDepth;
                //For each child set its depth
                this.childs.forEach(child => child.setDepth(newDepth + 1));
            },
            setTab: function (newTab) {

                this.tab = newTab;
                var childDepths = new Map();
                this.childs.forEach(child => childDepths.set(child.depth, 1 + (childDepths.get(child.depth) || 0)));

                var toDo = null;
                //console.log(childDepths);
                if (childDepths.size === 0) {
                    //No childs
                    //console.log("nochilds");
                    return;
                }
                else if (childDepths.size === 1) {
                    //Childs are all on the same depth
                    toDo = (child) => child.setTab(newTab);
                    //console.log("+0")
                }
                else if (childDepths.size === 2) {
                    //The childs of this have 2 different levels of depth so it is the case to use tabs
                    var maxDepth = 0;

                    for (var depth of childDepths.keys())
                        maxDepth = depth > maxDepth ? depth : maxDepth;

                    toDo = (child) => {
                        //The child which is at maximum depth is the merge node so it should not be tabbed
                        child.depth === maxDepth ? child.setTab(newTab) : child.setTab(newTab + 1);
                    }
                }
                else {
                    //Complex network
                    throw "not yet implemented";
                }

                this.childs.forEach(child => toDo(child));
            },
            updateChildsHorizontalPosition: function () {
                var order = 0;

                this.childs.forEach(child => {
                    child.siblingsNum = this.childs.size;
                    child.order = order;
                    order++;
                    child.updateChildsHorizontalPosition();
                });
            },
            updateParentsHeight: function () {
                if (this.parents.size === 0) return;

                var maxDepth = d3.max(Array.from(this.parents.values()), parent => {
                    console.log(parent);
                    return parent.depth;
                });

                this.parents.forEach(parent => {
                    parent.height = 1 + (maxDepth - parent.depth);
                    parent.updateParentsHeight();
                });
            }
        };

        //add the created node to the list of nodes of this graph
        this.nodes.set(id, node);

        //end of createNode()
        return node;
    },
    addParentChildRel: function (parentId, childId) {
        //if parent or child are null throw error
        if (!this.nodes.has(childId) || !this.nodes.has(parentId))
            throw "error parent or child not found";

        var parentNode = this.nodes.get(parentId);
        var childNode = this.nodes.get(childId);

        parentNode.addChild(childNode);
        childNode.addParent(parentNode);
    },
    //Returns the only node without any parents
    getRoot() {
        for (var node of this.nodes.values()) {
            if (node.parents.size === 0)
                return node;
        }

        throw "No root found";
    },
    //Set depth of the root, will go down to all the nodes by design
    updateDepth() {
        var root = this.getRoot();
        root.setDepth(0);
    },

    updateTabs() {
        this.getRoot().setTab(0);
    },

    updateChildsPosition() {
        this.getRoot().updateChildsHorizontalPosition();
    },
    updateNodesHeight() {
        var leafs = Array.from(this.nodes.values()).filter(e => e.childs.size === 0);
        console.log(leafs);
        leafs.forEach(leaf => {
            leaf.updateParentsHeight();
        });
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
    graph.updateTabs();
    graph.updateChildsPosition();
    graph.updateNodesHeight();

    console.log("graph");
    console.log(graph);
    console.log("nodes");
    console.log(Array.from(graph.nodes.values()));
}

d3.json("data/AnnaNet/net.json", function (error, json) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    createGraph(json);
    getdata(graph);
    //console.log("json");
    //console.log(json);
});
