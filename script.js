/**
 * FeatureLayer.selection-complete
 * @external FeatureLayer#event:selection-complete
 * @see {link:https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#event-selection-complete}
 * @member {Graphic[]} features - The features that were selected by a query.
 * @member {Number} method - The selection method.
 * @member {FeatureLayer} target - The feature layer that performed the selection.
 */

/**
 * Create map response
 * @external createMapResponse
 * @see {@link https://developers.arcgis.com/javascript/jsapi/esri.arcgis.utils-amd.html#createmap esri/arcgis/utils.createMap()
 * @member {external:esri/Map} map
 * @member {(EventHandler|undefined)} clickEventHandle
 * @member {(Function|undefined)} clickEventListener
 * @member {Object} itemInfo
 * @member {Object} itemInfo.item
 * @member {Object} itemInfo.itemData
 * @member {Object.<string, Error>} itemInfo.errors
 */

/**
 * dojo/Deferred
 * @description Deferred response from an asynchronous operation.
 * @external dojo/Deferred
 * @see {@link http://dojotoolkit.org/reference-guide/1.10/dojo/Deferred.html dojo/Deferred}
 */

require([
  "esri/config",
  "esri/map",
  "esri/geometry/geometryEngineAsync",
  "esri/tasks/query",
  "esri/layers/FeatureLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/dijit/FeatureTable",
  "esri/dijit/LayerList",
  "esri/dijit/HomeButton",
  "dijit/registry",
  "witpa/ProjectFilter",
  "dojo/parser",
  "dojo/dnd/Moveable",
  "esri/arcgis/utils",
  "esri/dijit/Search",
  "esri/dijit/BasemapGallery",
  "esri/dijit/Legend",
  "witpa/infoWindowUtils",
  "dojo/text!./webmap/item.json",
  "dojo/text!./webmap/itemdata.json",

  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/layout/AccordionContainer",
  "dijit/layout/AccordionPane",
  "dijit/Dialog"
], function (
  esriConfig,
  Map,
  geometryEngineAsync,
  Query,
  FeatureLayer,
  ArcGISDynamicMapServiceLayer,
  FeatureTable,
  LayerList,
  HomeButton,
  registry,
  ProjectFilter,
  parser,
  Moveable,
  arcgisUtils,
  Search,
  BasemapGallery,
  Legend,
  infoWindowUtils,
  webmapItem,
  webmapItemData
) {
    "use strict";
    var projectFilter = new ProjectFilter(document.forms.filterForm);
    var filterPane = document.getElementById("filterPane");

    filterPane.appendChild(projectFilter.form);

    ["wsdot.wa.gov", "www.wsdot.wa.gov", "data.wsdot.wa.gov", "hqolymgis98d:6080"].forEach(function (server) {
        esriConfig.defaults.io.corsEnabledServers.push(server);
    });

    // Parse the Dojo layout widgets defined in HTML markup.
    parser.parse();

    // Create the map using JSON webmap definition.
    arcgisUtils.createMap({
        item: JSON.parse(webmapItem),
        itemData: JSON.parse(webmapItemData)
    }, "map", {
        mapOptions: {
            center: [-120.80566406246835, 47.41322033015946],
            zoom: 7,
            lods: [
                { "level": 0, "resolution": 56543.033928, "scale": 591657527.591555 },
                { "level": 1, "resolution": 78271.5169639999, "scale": 295828763.795777 },
                { "level": 2, "resolution": 39135.7584820001, "scale": 147914381.897889 },
                { "level": 3, "resolution": 19567.8792409999, "scale": 73957190.948944 },
                { "level": 4, "resolution": 9783.93962049996, "scale": 36978595.474472 },
                { "level": 5, "resolution": 4891.96981024998, "scale": 18489297.737236 },
                { "level": 6, "resolution": 2445.98490512499, "scale": 9244648.868618 },
                { "level": 7, "resolution": 1222.99245256249, "scale": 4622324.434309 },
                { "level": 8, "resolution": 611.49622628138, "scale": 2311162.217155 },
                { "level": 9, "resolution": 305.748113140558, "scale": 1155581.108577 },
                { "level": 10, "resolution": 152.874056570411, "scale": 577790.554289 },
                { "level": 11, "resolution": 76.4370282850732, "scale": 288895.0 },
                { "level": 12, "resolution": 38.2185141425366, "scale": 144447.638572 },
                { "level": 13, "resolution": 19.1092570712683, "scale": 72223.819286 },
                { "level": 14, "resolution": 9.55462853563415, "scale": 36111.909643 },
                { "level": 15, "resolution": 4.77731426794937, "scale": 18055.954822 },
                { "level": 16, "resolution": 2.38865713397468, "scale": 9027.977411 },
                { "level": 17, "resolution": 1.19432856685505, "scale": 4513.988705 },
                { "level": 18, "resolution": 0.597164283559817, "scale": 2256.994353 },
                { "level": 19, "resolution": 0.298582141647617, "scale": 1128.497176 }
            ],
            minZoom: 7,
            maxZoom: 19
        }
    }
    /**
     * Post map creation tasks.
     * @param {external:createMapResponse} response
     */
    ).then(function (response) {
        var map = response.map;

        infoWindowUtils.makeInfoWindowDraggable(response.map.infoWindow);

        var dynamicLayer = map.getLayer("SixYearPlan");

        var search = new Search({
            map: response.map
        }, "search");

        search.on("load", function () {
            var sources, source;
            sources = search.get("sources");
            source = search.defaultSource; //or sources[0];
            source.countryCode = "US";
            source.searchExtent = response.map.extent;
            search.set("sources", sources);
        });

        search.startup();

        var outFields = [
          "OBJECTID",
          "Region",
          "PIN",
          "Project_Title",
          "Improvement_Type",
          "Program",
          "Sub_Program",
          "Work_Description",
          "PE_Start_Date",
          "Ad_Date",
          "OC_Date",
          "Revenue_Package",
          "Funding_Source",
          "Congressional_District",
          "Legislative_District",
          "County",
          "Route",
          "Begin_Mile_Post",
          "End_Mile_Post",
          "Shape",
          "LRS_Date"
        ];

        var table;

        // Create the feature layer that will be used by the FeatureTable and to highlight selected table rows on the map.
        var featureLayerUrl = [dynamicLayer.url, "0"].join("/");
        var layer = new FeatureLayer(featureLayerUrl, {
            id: "wsdotprojects",
            mode: FeatureLayer.MODE_SELECTION,
            outFields: outFields
        });

        map.addLayer(layer);

        // When the user submits a query, set the feature layer's definition expression 
        // so that only those rows are shown in the table.
        projectFilter.form.addEventListener("submit-query", function (e) {
            layer.clearSelection();
            layer.setDefinitionExpression(e.detail.where);
            dynamicLayer.setLayerDefinitions([
                e.detail.where
            ]);
            table.grid.refresh();

        });

        // Reset the definition expression to show all rows.
        projectFilter.form.addEventListener("reset", function (e) {
            layer.clearSelection();
            dynamicLayer.setDefaultLayerDefinitions();
            layer.setDefinitionExpression(layer.defaultDefinitionExpression);
            table.grid.refresh();
        });


        // Add the home button that allows the user to zoom to full extent.
        var homeButton = new HomeButton({
            map: map
        }, "homeButton");
        homeButton.startup();

        // Create the feature table
        table = new FeatureTable({
            featureLayer: layer,
            outFields: outFields,
            // Clicking on the layer won't work since the feature layer isn't displayed on the map.
            // The feature layer only displays its selected features.
            enableLayerClick: false,
            enableLayerSelection: false,
            // The dateOptions are not actually honored: https://geonet.esri.com/message/520158
            /*
            dateOptions: {
              datePattern: "yyyyMMdd",
              timeEnabled: false,
              timePattern: null
            },
            */
            // These fields are hidden by default, but user can turn them back on.
            hiddenFields: [
              "Direction_Ind",
              "LSR_Date",
              "GIS_Route",
              "Begin_ARM",
              "End_ARM",
              "RRT",
              "RRQ",
              "SRMP_Date",
              "Web_Page",
              "Mid_Arm"

            ],
            map: map
        }, "table");
        table.startup();

        /**
         * @typedef {Object} DGridRow
         * @property {Object} data
         * @property {number} data.OBJECTID
         * @property {HTMLElement} element
         * @property {string} id - A string containing the corresponding feature's Object ID.
         */

        /**
         * Selects or deselects features corresponding to row selected in the feature table.
         * @param {DGridRow[]} rows - An array of rows either selected or deselected from the feature table dGrid.
         * @param {Boolean} [deselect=false] - True to subtract the features associated with the rows to the feature layer selection, false to add them.
         * @returns {external:dojo/Deferred} Returns the promise from the selectFeatures function.
         */
        function selectOrDeselectFeatures(rows, deselect) {
            var selectionMethod = deselect ? FeatureLayer.SELECTION_SUBTRACT : FeatureLayer.SELECTION_ADD;
            var query = new Query();
            // Convert the array of rows into an array of corresponding object IDs.
            var objectIds = rows.map(function (row) {
                return parseInt(row.id, 10);
            });
            query.objectIds = objectIds;
            return layer.selectFeatures(query, selectionMethod).then(function () {
                var features = layer.getSelectedFeatures();
                var geometries;
                if (features && features.length > 0) {
                    if (features.length === 1) {
                        map.setExtent(features[0].geometry.getExtent(), true);
                    } else {
                        geometries = features.map(function (graphic) {
                            return graphic.geometry;
                        });
                        geometryEngineAsync.union(geometries).then(function (unionedGeometry) {
                            map.setExtent(unionedGeometry.getExtent(), true);
                        });
                    }
                }
            });
        }

        /**
         * 
         * @param {DGridRow} rows
         */
        table.on("dgrid-select", function (rows) {
            selectOrDeselectFeatures(rows);
        });

        table.on("dgrid-deselect", function (rows) {
            selectOrDeselectFeatures(rows, true);
        });

        // resize panel when table close is toggled.
        table.tableCloseButton.addEventListener("click", function (e) {
            var gridMenuNode = registry.byId(table._gridMenu).domNode;
            var tableNode = registry.byId("tablePane").domNode;
            var borderContainer = registry.byId("borderContainer");
            var isOpening = e.target.classList.contains("toggleClosed");
            if (isOpening) {
                tableNode.style.height = tableNode.dataset.openHeight || "50%";
            } else {
                // Store the old height.
                tableNode.dataset.openHeight = tableNode.style.height || [tableNode.clientHeight, "px"].join("");
                // Set to "closed" height.
                tableNode.style.height = [gridMenuNode.clientHeight, "px"].join("");
            }
            borderContainer.resize();
        });

        var layerListItems = arcgisUtils.getLayerList(response);

        // Custom sort the layer list items array so that the item with the 
        // title containing "WSDOT Projects" is last in the array. Other
        // items will remain in their original order.
        layerListItems.sort(function (a, b) {
            var re = /WSDOT Projects/i;
            var output;
            if (re.test(a.title)) {
                output = 1;
            } else if (re.test(b.title)) {
                output = -1;
            } else {
                output = 0;
            }
            return output;
        });

        // Create the layer list.
        var layerList = new LayerList({
            map: response.map,
            layers: layerListItems,
            showLegend: true,
            showOpacitySlider: true,
            showSublayers: true
        }, "layerList");
        layerList.startup();

        var basemapGallery = new BasemapGallery({
            map: response.map,
            basemapsGroup: {
                id: "085a9cb0bb664d29bf62b731ccc4aa64"
            },
            basemapIds: ["wsdotbasemap"]
        }, "basemapGallery");
        basemapGallery.startup();

        basemapGallery.on("load", function () {
            var basemap, basemaps = basemapGallery.basemaps.filter(function (basemap) {
                return basemap.title === "WSDOT Base Map";
            });
            if (basemaps && basemaps.length > 0) {
                basemap = basemaps[0];
                basemapGallery.select(basemap.id);
            }
        });

        var legend = new Legend({
            map: response.map,
            layerInfos: arcgisUtils.getLegendLayers(response)
        }, "legend");
        legend.startup();

    });

    // Show the disclaimer dialog.
    var disclaimerDialog = registry.byId("disclaimerDialog");
    disclaimerDialog.domNode.querySelector("button").onclick = function () {
        // Hide and then destroy the dialog.
        disclaimerDialog.hide();
    };
    disclaimerDialog.show();
});