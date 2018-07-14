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

            this.childs.forEach(child => {
                child.siblingsNum = childsInDepths[[child.depth, child.isMainBranch]].length;
                child.order = childsInDepths[[child.depth, child.isMainBranch]].indexOf(child);
                child.updateChildsHorizontalPosition();
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
            this.childsArr.forEach(child => child.updateParentsHeight());
        },
        upperHierarchyContains: function (node, pathSet) {
            /*
             * Search goes bottom to top
             * Given the gaph properties, if the depth of the current node is less than
             * the depth of the node we are searching, we will not find it going higher.
             *
             */
            if (this === node)
                return true;

            if (this.depth < node.depth)
                return false;

            var found = false;
            this.isInPath = 0;

            this.parentsArr.forEach(parent => {
                //Parent has already been analyzed
                if (parent.isInPath === -1) {
                    found = parent.upperHierarchyContains(node, pathSet);
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