/**
 * Module to fix issues with {@link external:FeatureTable}.
 * @module fixFeatureTableBugs
 * @example
 * require(["fixFeatureTableBugs", "esri/dijit/FeatureTable"], function(fixFeatureTableBugs, FeatureTable) {
 *      // #tablePane is a div that will contain the feature table.
 *      fixFeatureTableBugs(document.getElementById("tablePane"));
 * });
 */
define(function () {
    "use strict";

    /**
     * Checks a table cell to see if it contains 1970-01-01 (UTC).
     * If it does, the text content of the cell is cleared.
     * @param {HTMLElement} cell - Table cell.
     */
    function replaceUtc0(cell) {
        if (cell.textContent.match(/19(?:(?:69)|(?:70))/)) {
            var date = Date.parse(cell.textContent);
            if (!isNaN(date) && date <= 0) {
                cell.textContent = "";
            }
        }
    }

    /**
     * At ArcGIS API v3.15, FeatureTable shows null date values as 1970-01-01 UTC.
     * This function will correct these table cells so that they will be blank instead.
     * @param {MutationRecord[]} mutations - Mutation records that were performed on the table.
     * @param {MutationObserver} mutationObserver - The MutationObserver that called this function.
     */
    function fixDates(mutations, mutationObserver) {
        mutations.forEach(function (mr) {
            // Continue to the next record if this is not a node add.
            if (!(mr.type === "childList" && mr.addedNodes.length > 0)) {
                return;
            }

            // Clear the text from all cells that have 0 UTC date displayed.
            Array.from(mr.addedNodes, function (node) {
                var cells;
                if (node.classList && node.classList.contains("dgrid-row")) {
                    cells = node.querySelectorAll(".dgrid-cell");
                    Array.from(cells, replaceUtc0);
                }
            });
        });
    }

    var tableMutationObserver = new MutationObserver(fixDates);

    /**
     * Observes changes to given node. Replaces bad representation of null dates with blank text.
     * @param {HTMLElement} domNode - The DOM node to observe.
     * @returns {MutationObserver} - Returns the MutationObserver that is observing the DOM node.
     * @alias module:fixFeatureTableBugs
     */
    return function (domNode) {
        // Create mutation observer to remove 1-1-1970 UTC dates as they are added.
        tableMutationObserver.observe(domNode, {
            childList: true,
            subtree: true
        });

        return tableMutationObserver;
    }
});