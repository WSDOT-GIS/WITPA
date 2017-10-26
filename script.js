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
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "witpa/infoWindowUtils",
  "witpa/wsdotMapUtils",
  "dojo/text!./webmap/item.json",
  "dojo/text!./webmap/itemdata.json",
  "jquery-ui/widgets/autocomplete",

  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/layout/AccordionContainer",
  "dijit/layout/AccordionPane"
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
  SimpleLineSymbol,
  Color,
  infoWindowUtils,
  wsdotMapUtils,
  webmapItem,
  webmapItemData,

  autocomplete
) {
    "use strict";

    // Register the dialog with the dialog polyfill
    // if the browser does not natively support
    // the dialog element.
    if (dialogPolyfillRequired) {
        (function (dialogs) {
            Array.from(dialogs, function (d) {
                dialogPolyfill.registerDialog(d);
            });
        }(document.querySelectorAll("dialog")));
    }

    // Setup dialog close button.
    Array.from(document.querySelectorAll("dialog"), function (d) {
        var closeButton = d.querySelector("button[value='close']");
        if (closeButton) {
            closeButton.addEventListener("click", function (e) {
                d.close();
            });
        }
    });

    var projectFilter = new ProjectFilter();
    var filterPane = document.getElementById("filterPane");

    filterPane.appendChild(projectFilter.form);

    // Parse the Dojo layout widgets defined in HTML markup.
    parser.parse();

    webmapItem = JSON.parse(webmapItem);
    webmapItemData = JSON.parse(webmapItemData);

    var mapOptions = wsdotMapUtils.defaultMapOptions;
    mapOptions.minZoom = 7;

    // Create the map using JSON webmap definition.
    arcgisUtils.createMap({
        item: webmapItem,
        itemData: webmapItemData
    }, "map", {
        mapOptions: mapOptions
    }
    /**
     * Post map creation tasks.
     * @param {external:createMapResponse} response
     */
    ).then(function (response) {
        var map = response.map;

        infoWindowUtils.makeInfoWindowDraggable(response.map.infoWindow);

        var dynamicLayer = map.getLayer("PlannedProjects");

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
            //"OBJECTID",
            "StateRouteNumber",
            "Project_Title",
            "County",
            "Legislative_District",
            "Revenue_Package",
            "Sub_Category",
            "PIN",
            "Improvement_Type",
            "Work_Description",
            "Sub_Program",
            "Region",
            "Program",
            "Begin_Preliminary_Engineering",
            "Advertisement_Date",
            "Operationally_Complete",
            "Congressional_District",
            "Begin_Mile_Post",
            "End_Mile_Post",
            "Total_Dollars",
            "Direction_Ind",
            "RouteID",
            "Begin_ARM",
            "End_ARM",
            "SRMP_Begin_AB_Ind",
            "SRMP_End_AB_Ind",
            "SRMP_Date",
            "LRSDATE",
            "RelRouteType",
            "RelRouteQual",
            "Mid_Arm",
            "Mid_Mile_Post",
            "Project_List",
            "LOC_ERROR"
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

        var selectionSymbol = new SimpleLineSymbol().setColor(new Color([0, 255, 255, 1])).setWidth(2);
        layer.setSelectionSymbol(selectionSymbol);


        // When the user submits a query, set the feature layer's definition expression
        // so that only those rows are shown in the table.
        projectFilter.form.addEventListener("submit-query", function (e) {
            layer.clearSelection();
            // Google analytics
            if (window.ga) {
                window.ga('send', 'event', "filter", "select", "where", e.detail.where);
            }
            layer.setDefinitionExpression(e.detail.where);
            dynamicLayer.setLayerDefinitions([
                e.detail.where
            ]);

            /**
             * Set the map extent to the extent of the currently selected features (if any).
             * @param {Object} queryExtentRespnonse - Response from the extent query.
             * @param {number} queryExtentRespnonse.count - Number of features selected.
             * @param {Extent} queryExtentRespnonse.extent - The extent of the selected features.
             */
            layer.queryExtent(new Query()).then(function (queryExtentResponse) {
                var extent = queryExtentResponse.extent;
                if (queryExtentResponse.count && queryExtentResponse.count > 0) {
                    map.setExtent(extent);
                }
            });
            createTable();
            //table.grid.refresh();

        });

        // Reset the definition expression to show all rows.
        projectFilter.form.addEventListener("reset", function (e) {
            layer.clearSelection();
            dynamicLayer.setDefaultLayerDefinitions();
            layer.setDefinitionExpression(layer.defaultDefinitionExpression);
            createTable();
            //table.grid.refresh();
        });


        // Add the home button that allows the user to zoom to full extent.
        var homeButton = new HomeButton({
            map: map
        }, "homeButton");
        homeButton.startup();

        function createTable() {
            // Destroy existing table.
            if (table) {
                table.destroyRecursive();
                registry.byId("tablePane").domNode.innerHTML = '<div id="table"></div>';
            }

            /**
             * Resizes the table panel as the table is collapsed or expanded.
             * @param {Event} e - Table close button click event.
             */
            function resizeTablePanel(e) {
                var gridHeaderNode = table._gridHeaderNode || table._gridMenu;
                var tableNode = registry.byId("tablePane").domNode;
                var borderContainer = registry.byId("borderContainer");
                var isOpening = e.target.classList.contains("toggleClosed");
                if (isOpening) {
                    tableNode.style.height = tableNode.dataset.openHeight || "50%";
                } else {
                    // Store the old height.
                    tableNode.dataset.openHeight = tableNode.style.height || [tableNode.clientHeight, "px"].join("");
                    // Set to "closed" height.
                    tableNode.style.height = [gridHeaderNode.clientHeight, "px"].join("");
                }
                borderContainer.resize();
            }

            // Create the feature table
            table = new FeatureTable({
                map: map,
                featureLayer: layer,
                outFields: outFields,
                editable: false,
                syncSelection: false,
                zoomToSelection: false,
                // These fields are hidden by default, but user can turn them back on.
                hiddenFields: [
                    "Direction_Ind",
                    "RouteID",
                    "Begin_ARM",
                    "End_ARM",
                    "SRMP_Begin_AB_Ind",
                    "SRMP_End_AB_Ind",
                    "SRMP_Date",
                    "LRSDATE",
                    "RelRouteType",
                    "RelRouteQual",
                    "Mid_Arm",
                    "Mid_Mile_Post",
                    "Project_List",
                    "LOC_ERROR"
                ],
                showGridHeader: true,
                gridOptions: {
                    cellNavigation: false
                }
            }, "table");
            table.startup();

            // event handler setup
            /**
             *
             * @param {DGridRow[]} rows - The rows that were selected
             */
            table.on("row-select", function (rows) {
                selectOrDeselectFeatures(rows);
            });

            /**
             *
             * @param {DGridRow[]} rows - The rows that were unselected
             */
            table.on("row-deselect", function (rows) {
                selectOrDeselectFeatures(rows, true);
            });

            table.on("refresh", function (e) {
                // Show a modal dialog if all records have been
                // filtered out by the user.
                var dialog;
                if (e.results && e.results.length <= 0) {
                    dialog = document.getElementById("noDataDialog");
                    dialog.showModal();
                }
            });

            // resize panel when table close is toggled.
            if (table.tableCloseButton) {
                table.tableCloseButton.addEventListener("click", resizeTablePanel);
            }
        }

        createTable();

        /**
         * Zooms the map to the extent of the input features
         * @param {external:Graphic[]} features - An array of graphic objects.
         */
        function zoomToFeatures(features) {
            var geometries;
            // Make sure there actually are features before proceeding.
            if (features && features.length > 0) {
                if (features.length === 1) {
                    // If there's only one feature, just zoom to its extent.
                    map.setExtent(features[0].geometry.getExtent(), true);
                } else {
                    // Create an array of geometries from the graphics' array.
                    geometries = features.map(function (graphic) {
                        return graphic.geometry;
                    });
                    // Union the geometries into a single geometry, then zoom to unioned geometry's extent.
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



        var layerListItems = arcgisUtils.getLayerList(response);

        // Custom sort the layer list items array so that the item with the
        // title containing "Planned Projects" is last in the array. Other
        // items will remain in their original order.
        layerListItems.sort(function (a, b) {
            var re = /(?:(?:Planned\s?Projects)|(?:Six-Year\sPlan))/i;
            var output;
            if (re.test(a.title) && !re.test(b.title)) {
                output = 1;
            } else if (re.test(b.title) && !re.test(a.title)) {
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
                var datalist, docFrag, option;
                //var selector = "select[name={fieldName}], datalist[data-field-name='{fieldName}']".replace(/\{fieldName\}/g, fieldName);
                var selector = "select[name={fieldName}], input[name='{fieldName}']".replace(/\{fieldName\}/g, fieldName);

                var input;
                datalist = document.querySelector(selector);
                if (datalist) {
                    // For select element, add empty element to beginning of options list.
                    if (datalist instanceof HTMLSelectElement) {
                        docFrag = document.createDocumentFragment();
                        option = document.createElement("option");
                        option.selected = true;
                        docFrag.appendChild(option);
                        values.forEach(function (value) {
                            option = document.createElement("option");
                            option.value = value;
                            option.textContent = value.toString();
                            docFrag.appendChild(option);
                        });
                        datalist.appendChild(docFrag);
                    } else if (datalist instanceof HTMLInputElement) {
                        datalist.dataset.list = null;
                        autocomplete({
                            source: values
                        }, datalist);
                    }
                } else {
                    console.warn("Neither <input> nor <select> found for " + fieldName + ".", values);
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
    }(getOperationalLayer(webmapItemData, "PlannedProjects").url + "/0"));
});