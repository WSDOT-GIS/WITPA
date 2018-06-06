import Moveable = require("dojo/dnd/Moveable");
import InfoWindow = require("esri/dijit/InfoWindow");

/**
 * Utilites for use with {@link external:esri/dijit/InfoWindow} objects.
 * @exports infoWindowUtils
 */

/**
 * Makes an InfoWindow draggable.
 * @param {external:esri/dijit/InfoWindow} infoWindow - An info window.
 */
export function makeInfoWindowDraggable(this: any, infoWindow: InfoWindow) {
  const handle = infoWindow.domNode.querySelector(".title");
  const dnd = new Moveable(infoWindow.domNode, {
    handle
  });

  // when the infoWindow is moved, hide the arrow:
  dnd.on(
    "FirstMove",
    function() {
      // hide pointer and outerpointer (used depending on where the pointer is shown)
      let arrowNode = infoWindow.domNode.querySelector(".outerPointer");
      arrowNode.classList.add("hidden");

      arrowNode = infoWindow.domNode.querySelector(".pointer");
      arrowNode.classList.add("hidden");
    }.bind(this)
  );
}
