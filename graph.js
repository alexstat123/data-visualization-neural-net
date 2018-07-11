// Load CSV file

//Graph object
graph = {
    /*
        Node dictionary
        id=>nodeObject
     */
    nodes: new Map(),
    nodesArray: [],
    nodesColorScale: null,
    layerTypes: [],

    //Given an id, returns the node object
    getNode: function (id) {
        var node = this.nodes[id];
        return node;
    },
    nodeFromJson(data) {
        var id = data.id;

        //If node already there, just return it
        if (this.nodes.has(id))
            return this.nodes.get(id);
        var node = createNode(data);

        //add the created node to the list of nodes of this graph
        this.nodes.set(id, node);
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
        var leafs = this.nodesArray.filter(e => e.childs.size === 0);
        leafs.forEach(leaf => {
            leaf.height = 1;
            leaf.updateParentsHeight();
        });
    },
    getFixedLayersTypes() {
        return ["FullyConnected"
            , "Activation"
            , "Subsampling"
            , "ConvolutionalND"
            , "Split"
            , "Join"
            , "BatchNormalization"
            , "SoftmaxAlt"];
    },
    getActualLayersTypes() {
        return new Set(this.nodesArray.map(e => e.originalData.layerType));
    },
    updateNodesColors() {
        var layersType = [...new Set([...this.getFixedLayersTypes(), ...this.getActualLayersTypes()])];
        console.log(this.getActualLayersTypes());
        console.log(layersType);
        var c20 = d3.scaleOrdinal(d3['schemeCategory20']);

        this.nodesColorScale = layerType => {
            var idx = layersType.indexOf(layerType);
            if (idx > 20) idx = 20;
            return c20(idx);
        };

        this.nodesArray.forEach(node => {
            node.color = this.nodesColorScale(node.originalData.layerType);
            node.type = {"type": node.originalData.layerType, "color": node.color};
        });
    },
    getLayersColors() {
        var layersType = [...this.getActualLayersTypes()];

        return layersType.map(type => ({"type": type, "color": this.nodesColorScale(type)}))
    },
    BFS() {
        var nodesToCall = [this.getRoot()];
        var result = [];
        this.nodesArray.forEach(node => node.visited = false);
        while (nodesToCall.length !== 0) {
            var n = nodesToCall.shift();
            if (n.visited) {
                var index = result.indexOf(n);
                if (index > -1) {
                    result.splice(index, 1);
                }
            }
            result.push(n);
            n.visited = true;
            nodesToCall.push(...n.childs.values());
        }
        this.nodesArray = result;
    },
    deselectAllNodes() {
        this.nodesArray.forEach(node => node.selected = false);
    },
    getSelectedNodes() {
        return this.nodesArray.filter(node => node.selected);
    },
    filterNodes(filter) {
        return this.nodesArray.filter(filter);
    },
    getAllPathsBetween(nodeA, nodeB) {
        this.nodesArray.forEach(node => node.isInPath = false);

        if (nodeA.depth > nodeB.depth) {
            var tmp = nodeA;
            nodeA = nodeB;
            nodeB = tmp;
        }

        var setResult = new Set();
        nodeB.upperHierarchyContains(nodeA, setResult);
        setResult.add(nodeA);
        setResult.add(nodeB);
        return setResult;
    },
    clear() {
        this.nodesArray = [];
        this.nodes.clear();
    }

};

//Create the graph, input the whole json
function createGraph(neuralNetwork) {

    graph.clear();
    //foreach layer create the relative node
    neuralNetwork.netLayers.forEach(function (row) {
        graph.nodeFromJson(row);
    });
    //Foreach link in links
    neuralNetwork.links.forEach(function (row) {
        row.idsNext.forEach(function (link) {
            //foreach idsNext in the array set idPrev as father of idsNext
            graph.addParentChildRel(row.idPrev, link);
        })
    });

    graph.BFS();
    graph.updateDepth();
    graph.updateTabs();
    graph.updateChildsPosition();
    graph.updateNodesHeight();
    graph.updateNodesColors();

    $(window).trigger("graphLoaded", graph);
}

$(window).bind("load", function () {
    //d3.json("data/AnnaNet/net.json", function (error, json) {
    d3.json("data/childsTest/net.json", (error, json) => {
        if (error) {
            console.log(error);  //Log the error.
            throw error;
        }

        createGraph(json);
    });
});
