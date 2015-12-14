/**
 * Defines an operational layer in a web map
 * @external operationalLayer
 * @see {@link http://resources.arcgis.com/en/help/arcgis-web-map-json/#/operationalLayer/02qt00000006000000/ ArcGIS web map JSON format}
 */

/**
 * 
 * @external esri/layers/Layer
 * @see {@link https://developers.arcgis.com/javascript/jsapi/layer-amd.html esri/layers/layer}
 */

/**
 * Web Map base map definition
 * @external baseMap
 * @see {@link http://resources.arcgis.com/en/help/arcgis-web-map-json/#/baseMap/02qt00000004000000/ baseMap}
 */


define([
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/dijit/Basemap",
    "esri/dijit/BasemapLayer"
], function (
    ArcGISTiledMapServiceLayer,
    ArcGISDynamicMapServiceLayer,
    Basemap,
    BasemapLayer
) {

    /**
     * Creates a {external:esri/layers/Layer} and adds it as a property of the input object.
     * @param {external:operationalLayer} opLayerDef - Operational layer definition.
     * @returns {external:esri/layers/Layer} A layer object.
     */
    function createOperationalLayer(opLayerDef) {
        if (!opLayerDef) {
            throw new TypeError("No valid operational layer object was provided.");
        }

        var layer;

        if (opLayerDef.layerType === "ArcGISTiledMapServiceLayer") {
            layer = new ArcGISTiledMapServiceLayer(opLayerDef.url, {
                id: opLayerDef.id,
                visible: opLayerDef.visibility,
                opacity: opLayerDef.opacity
            });
        } else if (opLayerDef.layerType === "ArcGISMapServiceLayer") {
            layer = new ArcGISDynamicMapServiceLayer(opLayerDef.url, {
                id: opLayerDef.id,
                visible: opLayerDef.visibility,
                opacity: opLayerDef.opacity
            });
        } else {
            throw new Error(["Unsupported layer type:", opLayerDef.layerType].join(" "));
        }

        return layer;
    }

    /**
     * Customizes JSON parsing. Adds special handling for baseMap property.
     * @param {string} name - The property's name
     * @param {(string|number|Boolean|Object|Array)} value - The property's value.
     * @return {*}
     */
    function reviver(name, value) {
        var basemap, basemapLayers;
        if (name === "baseMap") {
            basemapLayers = value.baseMapLayers.map(function (o) {
                return new BasemapLayer(o);
            });
            basemap = new Basemap({
                layers: basemapLayers,
                title: value.title
            });
            return basemap;
        }
        else {
            return value;
        }
    }

    var exports = {
        /**
         * Parses ArcGIS web map JSON into an object.
         * @param {string} json - Web map definition string
         * @returns {Object}
         */
        parse: function (json) {
            var obj = JSON.parse(json, reviver);
            if (obj.operationalLayers && obj.operationalLayers.length > 0) {
                obj.operationalLayers.forEach(function (ol) {
                    var layerObject = createOperationalLayer(ol);
                    ol.layerObject = layerObject;
                });
            }
            return obj;
        }
    };

    return exports;
});