/*
       Given one row of the field layers
       of the json file,
       creates and returns the relative node object
 */
function createNode(nodeData) {
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

            if (this.tab > -1 && this.tab < newTab) {
                return;
            }

            this.tab = newTab;
            var childDepths = new Set([...this.childs.values()].map(node => node.depth));

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
                var maxDepth = d3.max([...childDepths]);
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

            this.parents.forEach(parent => {
                parent.height = this.depth - parent.depth;
                parent.updateParentsHeight();
            });
        },
        upperHierarchyContains: function (node, pathSet) {
            console.log(this);

            if (this === node)
                return true;

            if (this.depth < node.depth)
                return false;

            var found = false;
            for (const parent of this.parents.values()) {
                if (parent.isInPath || (parent.upperHierarchyContains(node, pathSet) && !found)) {
                    found = true;
                    this.isInPath = true;
                    pathSet.add(this);
                }
            }
            return found;
        }
    };


    //end of createNode()
    return node;
}