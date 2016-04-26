define([
  "dojo/dnd/Moveable"
], function (
  Moveable
) {
    "use strict";

    /**
     * Utilites for use with {@link external:esri/dijit/InfoWindow} objects.
     * @exports infoWindowUtils
     */

    var exports = {};

    /**
     * Makes an InfoWindow draggable.
     * @param {external:esri/dijit/InfoWindow} infoWindow - An info window.
     */
    exports.makeInfoWindowDraggable = function (infoWindow) {
        var handle = infoWindow.domNode.querySelector(".title");
        var dnd = new Moveable(infoWindow.domNode, {
            handle: handle
        });

        // when the infoWindow is moved, hide the arrow:
        dnd.on('FirstMove', function () {
            // hide pointer and outerpointer (used depending on where the pointer is shown)
            var arrowNode = infoWindow.domNode.querySelector(".outerPointer");
            arrowNode.classList.add("hidden");

            arrowNode = infoWindow.domNode.querySelector(".pointer");
            arrowNode.classList.add("hidden");
        }.bind(this));
    };

    return exports;
});