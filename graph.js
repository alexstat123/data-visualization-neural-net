// Load CSV file

//Graph object
graph = {
    /*
        Node dictionary
        id=>nodeObject
     */
    netId: '',
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

        this.nodesArray.forEach(node => {
            node.childsArr = Array.from(node.childs.values());
            node.parentsArr = Array.from(node.parents.values()).sort((a, b) => b.depth - a.depth);
        });
    },

    updateTabs() {
        this.getRoot().setTab(0);
    },

    updateChildsPosition() {
        this.nodesArray.forEach(node => node.updateChildsHorizontalPosition());

    },
    updateNodesHeight() {
        this.nodesArray.forEach(node => node.updateParentsHeight());
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
        return new Set(...[this.nodesArray.map(e => e.originalData.layerType)]);
    },
    updateNodesColors() {
        var layersType = this.getFixedLayersTypes();
        this.getActualLayersTypes().forEach(nodeType => {
            if (layersType.indexOf(nodeType) === -1) {
                layersType.push(nodeType);
            }
        });

        var c20 = d3.scaleOrdinal(d3['schemeCategory20']);
        d3.range(20).forEach(n => c20(n));

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
    updateClusters() {
        this.nodesArray.forEach(node => node.updateCluster());
    },
    BFS() {
        var nodesToCall = [this.getRoot()];
        var result = [];

        this.nodes.forEach(node => node.visited = false);
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
    selectNodesPrep(preposition) {
        this.nodes.forEach(node => node.selected = preposition(node));
    },
    getAllPathsBetween(nodeA, nodeB) {
        this.nodesArray.forEach(node => node.isInPath = -1);

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
    updateBranches() {
        var leafs = this.nodesArray.filter(e => e.childs.size === 0).sort((a, b) => b.depth - a.depth);
        leafs.shift().setHierarcyAsMain();
        leafs.forEach(node => node.setHierarcyAsSecondary());
    },
    clear() {
        this.nodesArray = [];
        this.nodes.clear();
    }

};

//Create the graph, input the whole json
function createGraph(neuralNetwork) {

    graph.clear();
    graph.netId = neuralNetwork.netId;
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
    graph.updateBranches();
    graph.updateTabs();
    graph.updateNodesHeight();

    graph.updateClusters();
    graph.updateChildsPosition();

    graph.updateNodesColors();
    $("#nnTitle").text(graph.netId);
    const titleHeight = $("#emptyCardHeight").height();
    settings.barHeight = (window.innerHeight - titleHeight - (settings.tabSize * 2)) / (graph.nodesArray[graph.nodesArray.length - 1].depth + 1);
    var earlyExits = graph.nodesArray.filter(node => !node.isMainBranch);
    settings.rootWidth = $("#container_neuralNetwork").width() - (settings.tabSize * 2);

    if (earlyExits.length !== 0) {
        settings.rootWidth /= 2;
        settings.rootWidth -= settings.tabSize
    }
    $(window).trigger("graphLoaded", graph);
}

$(window).bind("load", function () {
    d3.json("data/AnnaNet/net.json", function (error, json) {
        //  d3.json("data/childsTest/net.json", (error, json) => {
        if (error) {
            console.log(error);  //Log the error.
            throw error;
        }

        createGraph(json);
    });
});
