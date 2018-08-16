var camelCase = (function () {
    var DEFAULT_REGEX = /[-_]+(.)?/g;

    function toUpper(match, group1) {
        return group1 ? group1.toUpperCase() : '';
    }

    return function (str, delimiters) {
        return str.replace(delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toUpper);
    };
})();

/*
       Given one row of the field layers
       of the json file,
       creates and returns the relative node object
 */
function createNode(nodeData) {
    const toCut = [];
    const prefixRemove = property => {
        if ((nodeData.config || {})[property]) {
            const split = nodeData.config[property].split("$");
            nodeData.config[property] = split[split.length > 2 ? 1 : 0].toLowerCase();
            nodeData.config[property] = camelCase(nodeData.config[property]);
        }

    };

    toCut.push("batchNormType");
    toCut.push("activationType");
    toCut.push("splitType");
    toCut.push("joinType");
    toCut.push("poolingMode");

    if ((nodeData.config || {})['paramsInitializers']) {
        var split = nodeData.config['paramsInitializers'].replace("Map(", "");
        split = split.replace(")", "");
        split = split.replace(/'/g, "");
        split = split.split(", ");
        split = split.map(chunk => {
            const res = chunk.split(' -> ');
            return {key: res[0], val: res[1]};
        });
        var result = '';

        const valueReplace = {'ZerosInit': '0', 'OnesInit': 1, 'ReLUInit': 'relu', 'NullInit$': 'null'};
        split.forEach(chunk => {
            result += chunk.key.charAt(0).toUpperCase() + (valueReplace[chunk.val] || (chunk.val.charAt(0).toLowerCase() + chunk.val.slice(1)));
        });

        nodeData.config['paramsInitializers'] = result;
    }


    nodeData.id = camelCase(nodeData.id).replace('\'', '');
    toCut.forEach(prefixRemove);
    if ((nodeData.config || {})['poolingMode']) {
        var split = nodeData.config['poolingMode'].replace("Count", "Cnt");
        split = split.replace("Average", "Avg");
        split = split.replace('pooling', "");
        split = split.replace('Padding', "Pad");

        nodeData.config['poolingMode'] = split;
    }


    //Node object
    var node = {
        id: nodeData.id,
        originalData: nodeData,
        //position on the vertical axis
        depth: -1000,
        //how many siblings has the node
        siblingsNum: 0,
        // The order between siblings
        order: 0,
        // Nesting level
        tab: -1,
        // Height of the node
        height: -1,
        //Dictionary of nodes connected to this node "on top" part of it
        parents: new Map(),
        //Dictionary of nodes connected to this node "on bottom" part of it.
        childs: new Map(),
        isMainBranch: null,
        childsArr: [],
        parentsArr: [],
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
            this.childs.forEach(child => child.setDepth(newDepth + 1));
        },
        setTab: function (newTab) {
            //the childs have no order, so we need to pay attention to wheter the
            //tab has already been set to a value less then the newTab
            // ex. parent sets tab of the reentrant child, then sets tab of other childs
            //finally other childs will try to set again tab of reentrant child
            if (this.tab > -1 && this.tab < newTab) {
                return;
            }

            this.tab = newTab;
            // Children tabs are defined based on how many
            // different depths are connected to the current node
            // 0 depth => leaf
            // 1 depth => split node
            // 2 depth => tab node
            // 3 or more depths => not managed, complex network
            var childDepths = new Set(this.childsArr.map(node => node.depth));

            if (childDepths.size === 0) {
                return;
            }
            else if (childDepths.size === 1) {
                //Childs are all on the same depth
                this.childs.forEach(child => child.setTab(newTab));
            }
            else if (childDepths.size === 2) {
                //tab needed
                var maxDepth = d3.max([...childDepths]);
                this.childs.forEach(child => {
                    if (child.isMainBranch === this.isMainBranch) {
                        //The child which is at maximum depth is the merge node so it must not be tabbed
                        child.depth === maxDepth ? child.setTab(newTab) : child.setTab(newTab + 1);
                    } else {
                        //Secondary branches tabs does not depend on main branch tabs
                        child.setTab(0);
                    }
                });
            }
            else {
                //Complex network
                throw "not yet implemented";
            }

        },
        updateChildsHorizontalPosition: function () {
            // Order of the nodes on the x axis
            // Nodes on different depths (tabbed case) or in different branches (early exit)
            // must not share the order
            var childsInDepths = {};
            this.childs.forEach(child => {
                if (!childsInDepths[[child.depth, child.isMainBranch]]) {
                    childsInDepths[[child.depth, child.isMainBranch]] = [];
                }

                childsInDepths[[child.depth, child.isMainBranch]].push(child);
            });

            Object.keys(childsInDepths).forEach(key => {
                childsInDepths[key] = childsInDepths[key].sort((a, b) => a.cluster.maxHeight - b.cluster.maxHeight);
            });


            this.childs.forEach(child => {
                child.siblingsNum = childsInDepths[[child.depth, child.isMainBranch]].length;
                child.order = childsInDepths[[child.depth, child.isMainBranch]].indexOf(child);
            });
        },
        updateParentsHeight: function () {
            /**
             * Height of node is defined as
             * minimum depth of childern - node depth
             */
            if (this.childs.size === 0) {
                this.height = 1;
                return;
            }
            const minimumChildDepth = d3.min(this.childsArr, child => child.depth);
            this.height = minimumChildDepth - this.depth;
        },
        updateCluster() {

            if (this.parentsArr.length === 0 || this.parentsArr.length > 1 || this.parentsArr[0].childsArr.filter(node => node.isMainBranch).length > 1 || this.parentsArr[0].isMainBranch !== this.isMainBranch) {
                this.cluster = {};
                this.cluster.nodes = [];
                this.cluster.nodes.push(this);
                this.cluster.maxHeight = this.height;
                return;
            }
            this.cluster = this.parentsArr[0].cluster;
            this.cluster.nodes.push(this);
            if (this.height > this.cluster.maxHeight) {
                this.cluster.maxHeight = this.height;
            }
        },
        upperHierarchyContains: function (node, pathSet) {
            /*
             * Search goes bottom to top
             * Given the graph properties, if the depth of the current node is less than
             * the depth of the node we are searching, we will not find it going higher.
             *
             */
            this.isInPath = 0;

            if (this === node) {
                this.isInPath = 1;
                return true;
            }

            if (this.depth < node.depth)
                return false;

            var found = false;

            this.parentsArr.forEach(parent => {
                //Parent has already been analyzed
                if (parent.isInPath === -1) {
                    parent.upperHierarchyContains(node, pathSet);
                }

                if (parent.isInPath === 1) {
                    found = true;
                }
            });

            if (found) {
                this.isInPath = 1;
                pathSet.add(this);
            }
            return found;
        },
        setHierarcyAsMain() {
            this.isMainBranch = true;
            this.parentsArr.forEach(node => node.setHierarcyAsMain());
        },
        setHierarcyAsSecondary() {
            if (this.isMainBranch) {
                return;
            }

            this.isMainBranch = false;
            this.parentsArr.forEach(node => node.setHierarcyAsSecondary());
        }
    };


    //end of createNode()
    return node;
}