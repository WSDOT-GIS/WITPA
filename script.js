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
  "esri/tasks/QueryTask",
  "esri/tasks/StatisticDefinition",
  "witpa/infoWindowUtils",
  "witpa/wsdotMapUtils",
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
  QueryTask,
  StatisticDefinition,
  infoWindowUtils,
  wsdotMapUtils,
  webmapItem,
  webmapItemData
) {
    "use strict";
    var projectFilter = new ProjectFilter(document.forms.filterForm);
    var filterPane = document.getElementById("filterPane");

    filterPane.appendChild(projectFilter.form);

    ["hqolymgis98d"].forEach(function (server) {
        esriConfig.defaults.io.corsEnabledServers.push(server);
    });

    // Parse the Dojo layout widgets defined in HTML markup.
    parser.parse();

    webmapItem = JSON.parse(webmapItem);
    webmapItemData = JSON.parse(webmapItemData);

    // Create the map using JSON webmap definition.
    arcgisUtils.createMap({
        item: webmapItem,
        itemData: webmapItemData
    }, "map", {
        mapOptions: wsdotMapUtils.defaultMapOptions
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
            outFields: outFields,
            orderByFields: ["Project_Title"]
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
            var query = new Query();
            query.where = e.detail.where;
            layer.queryExtent(query).then(function (queryExtentResponse) {
                var extent = queryExtentResponse.extent;
                map.setExtent(extent);
            });
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
            syncSelection: false,
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
              "LRS_Date"
            ],
            showGridHeader: true,
            map: map
        }, "table");
        table.startup();

        function zoomToFeatures(features) {
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
        }

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
            return layer.selectFeatures(query, selectionMethod);
        }

        layer.on("selection-complete", function (features, selectionMethod) {
            features = layer.getSelectedFeatures();
            zoomToFeatures(features);
        });

        /**
         *
         * @param {DGridRow} rows
         */
        table.on("row-select", function (rows) {
            console.debug("row-select", rows);
            selectOrDeselectFeatures(rows);
        });

        table.on("row-deselect", function (rows) {
            console.debug("row-deselect", rows);
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
            basemaps: [
                wsdotMapUtils.esriBasemaps["wsdot-multilevel"]
            ],
            basemapIds: wsdotMapUtils.esriBasemaps["wsdot-multilevel"].layers.map(function (layer) {
                return layer.id;
            })
        }, "basemapGallery");
        basemapGallery.startup();

        // Select the default basemap in the gallery.
        basemapGallery.on("load", function () {
            var basemap, basemaps = basemapGallery.basemaps, i;
            if (basemaps && basemaps.length > 0) {
                for (i = 0; i < basemaps.length; i++) {
                    basemap = basemaps[i];
                    if (/wsdot[\-\s]?multilevel/i.test(basemap.id)) {
                        basemapGallery.select(basemap.id);
                        break;
                    }
                }
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
    var disclaimerOkButton = registry.byId("disclaimerButtonOk");
    disclaimerOkButton.on("click", function () {
        // Hide and then destroy the dialog.
        disclaimerDialog.hide();
    });
    disclaimerDialog.show();
    disclaimerDialog.resize();

    function getOperationalLayer(webMapData, opLayerId) {
        var opLayers = webMapData.operationalLayers;
        var opLayer;
        for (var i = 0; i < opLayers.length; i++) {
            if (opLayers[i].id === opLayerId) {
                opLayer = opLayers[i];
                break;
            }
        }
        return opLayer;
    }

    /**
     * Setup the background worker process for querying the 6-year project map service
     * for input suggestions.
     * @param {string} url - The URL for the map service layer to be queried.
     */
    (function (url) {

        if (!window.Worker) {
            console.log("This browser doesn't support web workers. Some features are not available.");
            return;
        }

        // Create the worker.
        var worker = new Worker("QueryWorker.js");

        /**
         * Handles messages from web worker.
         * @param {Event} e - worker message event
         * @param {Object} e.data - Data passed from worker.
         */
        worker.addEventListener("message", function (e) {

            /**
             * Adds values to the datalist corresponding to the given field name.
             * @param {string} fieldName - The name of a field in a map service layer.
             * @param {string[]} values - Values to be added to the datalist.
             */
            function addToDataList(fieldName, values) {
                var datalist, docFrag;
                datalist = document.querySelector("datalist[data-field-name='" + fieldName + "']");
                if (datalist) {
                    docFrag = document.createDocumentFragment();
                    values.forEach(function (value) {
                        var option = document.createElement("option");
                        option.value = value;
                        docFrag.appendChild(option);
                    });
                    datalist.appendChild(docFrag);
                }
            }

            /**
             * Adds attributes to input elements.
             * @param {Object.<string, Object.<string, string>>} values - Object containing objects containing date representation strings.
             */
            function addAttributes(values) {
                var fieldName, value, input, selector;
                for (fieldName in values) {
                    if (values.hasOwnProperty(fieldName)) {
                        value = values[fieldName];
                        selector = "input[type=date][name=" + fieldName + "]";
                        input = document.querySelector(selector);
                        if (input) {
                            for (var attrName in value) {
                                if (value.hasOwnProperty(attrName)) {
                                    input.setAttribute(attrName, value[attrName]);
                                }
                            }
                        } else {
                            console.error("Expected input element not found.", selector);
                        }
                    }
                }
            }

            // Get the data from the worker message.
            var data = e.data;
            // If the data contains a "fieldName" property, it is the result of
            // a query for unique values for a single field.
            //
            // If the data has a "ranges" property, it is the result of a query
            // for the min and max values of the date fields.
            if (data.fieldName) {
                addToDataList(data.fieldName, data.values);
            } else if (data.ranges) {
                addAttributes(data.ranges);
            }

        });

        // Set up worker event handler for error messages.
        worker.addEventListener("error", function (e) {
            console.error(e.data);
        });

        // Send the map service layer URL to the web worker, which will start it processing.
        worker.postMessage({ url: url });
    }(getOperationalLayer(webmapItemData, "SixYearPlan").url + "/0"));
});