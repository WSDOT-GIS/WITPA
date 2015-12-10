require([
  "esri/config",
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/dijit/FeatureTable",
  "esri/dijit/LayerList",
  "esri/dijit/HomeButton",
  "dijit/registry",
  "witpa/ProjectFilter",
  "dojo/parser",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/layout/AccordionContainer",
  "dijit/layout/AccordionPane"
], function (
  esriConfig,
  Map,
  FeatureLayer,
  ArcGISDynamicMapServiceLayer,
  FeatureTable,
  LayerList,
  HomeButton,
  registry,
  ProjectFilter,
  parser
) {

    var projectFilter = new ProjectFilter(document.forms.filterForm);
    var filterPane = document.getElementById("filterPane");

    filterPane.appendChild(projectFilter.form);

    projectFilter.form.addEventListener("submit-query", function (e) {
        console.log("submit-query event", e.detail.where);
    });

    esriConfig.defaults.io.corsEnabledServers.push("hqolymgis98d:6080");

    // Parse the Dojo layout widgets defined in HTML markup.
    parser.parse();

    var map = new Map("map", {
        basemap: "gray",
        center: [-120.80566406246835, 47.41322033015946],
        zoom: 7
    });

    // Create the dynamic map layer for display on the map.
    var dynamicLayer = new ArcGISDynamicMapServiceLayer("http://hqolymgis98d:6080/arcgis/rest/services/TransportationProjects/SixYearPlan/MapServer", {
        id: "wsdot_projects"
    });
    map.addLayer(dynamicLayer);

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
      "Ad_date",
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

    // Create the feature layer that will be used by the FeatureTable and to highlight selected table rows on the map.
    var featureLayerUrl = "http://hqolymgis98d:6080/arcgis/rest/services/TransportationProjects/SixYearPlan/MapServer/0";
    var layer = new FeatureLayer(featureLayerUrl, {
        id: "wsdotprojects",
        mode: FeatureLayer.MODE_SELECTION,
        outFields: outFields
    });
    map.addLayer(layer);

    map.on("load", function () {
        // Add the home button that allows the user to zoom to full extent.
        var homeButton = new HomeButton({
            map: map
        }, "homeButton");
        homeButton.startup();

        // Create the feature table
        var table = new FeatureTable({
            featureLayer: layer,
            outFields: outFields,
            // Clicking on the layer won't work since the feature layer isn't displayed on the map.
            // The feature layer only displays its selected features.
            enableLayerClick: false,
            enableLayerSelection: true,
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



    });

    // Create the layer list.
    var layerList = new LayerList({
        map: map,
        layers: [{
            layer: dynamicLayer,
            id: "WSDOT Projects (6 Year Plan)"
        }],
        showLegend: true,
        showOpacitySlider: true,
        showSublayers: true
    }, "layerList");
    layerList.startup();


});