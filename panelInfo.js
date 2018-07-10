function intersectKeys(firstSet, ...sets) {
    var count = sets.length;
    var result = new Set(firstSet); // Only create one copy of the set
    firstSet.forEach(item => {
        var i = count;
        var allHave = true;
        while (i--) {
            allHave = sets[i].has(item);
            if (!allHave) {
                break
            }  // loop only until item fails test
        }
        if (!allHave) {
            result.delete(item);  // remove item from set rather than
                                  // create a whole new set
        }
    });
    return result;
}

$(window).on("nodesSelectionChanged", updatePanel);

function updatePanel(event, newSelection) {
    console.log(newSelection);
    var sets = newSelection.map(node => new Set(Object.keys(node.originalData.config || {})));
    console.log(sets);
    console.log(intersectKeys(...sets));
}