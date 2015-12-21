/*
 * @external esri/dijit/InfoWindow
 * @see {@link https://developers.arcgis.com/javascript/jsapi/infowindow-amd.html InfoWindow}
 */

define([
  "dojo/dnd/Moveable"
], function (
  Moveable
) {
    "use strict";

    /**
     * Makes an InfoWindow draggable.
     * @param {external:esri/dijit/InfoWindow} infoWindow - An info window.
     */
    function makeInfoWindowDraggable(infoWindow) {
        var handle = infoWindow.domNode.querySelector(".title"); //query(".title", map.infoWindow.domNode)[0];
        var dnd = new Moveable(infoWindow.domNode, {
            handle: handle
        });
        
        // when the infoWindow is moved, hide the arrow:
        dnd.on('FirstMove', function() {
            // hide pointer and outerpointer (used depending on where the pointer is shown)
            var arrowNode =  infoWindow.domNode.querySelector(".outerPointer");
            arrowNode.classList.add("hidden");
            
            arrowNode =  infoWindow.domNode.querySelector(".pointer");
            arrowNode.classList.add("hidden");
        }.bind(this));
    }

    return {
        makeInfoWindowDraggable: makeInfoWindowDraggable
    }
});