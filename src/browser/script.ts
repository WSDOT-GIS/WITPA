import { IExtent, ILayer, IWebmap } from "@esri/arcgis-rest-common-types";
import dialogPolyfill from "dialog-polyfill";
import AccordionContainer = require("dijit/layout/AccordionContainer");
import AccordionPane = require("dijit/layout/AccordionPane");
import BorderContainer = require("dijit/layout/BorderContainer");
import ContentPane = require("dijit/layout/ContentPane");
import registry = require("dijit/registry");
import parser = require("dojo/parser");
import arcgisUtils = require("esri/arcgis/utils");
import Color = require("esri/Color");
import BasemapGallery = require("esri/dijit/BasemapGallery");
import FeatureTable = require("esri/dijit/FeatureTable");
import HomeButton = require("esri/dijit/HomeButton");
import LayerList = require("esri/dijit/LayerList");
import Legend = require("esri/dijit/Legend");
import Search = require("esri/dijit/Search");
import geometryEngineAsync = require("esri/geometry/geometryEngineAsync");
import Multipoint = require("esri/geometry/Multipoint");
import Point = require("esri/geometry/Point");
import Polygon = require("esri/geometry/Polygon");
import Polyline = require("esri/geometry/Polyline");
import Graphic = require("esri/graphic");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import EsriMap = require("esri/map");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import Query = require("esri/tasks/query");
import QueryTask = require("esri/tasks/QueryTask");
import { makeInfoWindowDraggable } from "./infoWindowUtils";
import ProjectFilter from "./ProjectFilter";
import webmapItem from "./webmap/item.json";
import webmapItemData from "./webmap/itemdata.json";
import { defaultMapOptions, esriBasemaps } from "./wsdotMapUtils";

/**
 * @typedef {Object} DGridRow
 * @property {Object} data
 * @property {number} data.OBJECTID
 * @property {HTMLElement} element
 * @property {string} id - A string containing the corresponding feature's Object ID.
 */
interface DGridRow {
  data: {
    OBJECTID: number;
  };
  element: HTMLElement;
  /**
   * A string containing the corresponding feature's Object ID.
   */
  id: string;
}

// Register the dialog with the dialog polyfill
// if the browser does not natively support
// the dialog element.
if (!(window as any).HTMLDialogElement) {
  (dialogs => {
    Array.from(dialogs, d => {
      dialogPolyfill.registerDialog(d);
    });
  })(document.querySelectorAll<HTMLDialogElement>("dialog"));
}

// Setup dialog close button.
Array.from(document.querySelectorAll<HTMLDialogElement>("dialog"), function(d) {
  const closeButton = d.querySelector("button[value='close']");
  if (closeButton) {
    closeButton.addEventListener("click", (e: Event) => {
      d.close();
    });
  }
});

const projectFilter = new ProjectFilter();
const filterPane = document.getElementById("filterPane")!;

filterPane.appendChild(projectFilter.form);

// Parse the Dojo layout widgets defined in HTML markup.
parser.parse();

const mapOptions = defaultMapOptions;
mapOptions.minZoom = 7;

/**
 * Response from the extent query.
 */
interface QueryExtentResponse {
  /** Number of features selected. */
  count: number;
  /** The extent of the selected features. */
  extent: IExtent;
}

// Create the map using JSON webmap definition.
arcgisUtils
  .createMap(
    {
      item: webmapItem,
      itemData: webmapItemData
    },
    "map",
    {
      mapOptions
    }
    /**
     * Post map creation tasks.
     * @param {external:createMapResponse} response
     */
  )
  .then((response: any) => {
    const map = response.map;

    makeInfoWindowDraggable(response.map.infoWindow);

    const dynamicLayer = map.getLayer("PlannedProjects");

    const search = new Search(
      {
        map: response.map
      },
      "search"
    );

    search.on("load", function() {
      const sources = search.get("sources");
      const source = search.defaultSource; // or sources[0];
      source.countryCode = "US";
      source.searchExtent = response.map.extent;
      search.set("sources", sources);
    });

    search.startup();

    const outFields = [
      // "OBJECTID",
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

    let table: FeatureTable;

    // Create the feature layer that will be used by the FeatureTable and to highlight selected table rows on the map.
    const featureLayerUrl = [dynamicLayer.url, "0"].join("/");
    const layer = new FeatureLayer(featureLayerUrl, {
      id: "wsdotprojects",
      mode: FeatureLayer.MODE_SELECTION,
      outFields
    });

    map.addLayer(layer);

    const selectionSymbol = new SimpleLineSymbol();
    selectionSymbol.setColor(new Color([0, 255, 255, 1]));
    selectionSymbol.setWidth(2);
    layer.setSelectionSymbol(selectionSymbol);

    // When the user submits a query, set the feature layer's definition expression
    // so that only those rows are shown in the table.
    projectFilter.form.addEventListener("submit-query", (e: any) => {
      layer.clearSelection();
      // Google analytics
      // @ts-ignore
      if (typeof ga !== "undefined") {
        // @ts-ignore
        ga("send", "event", "filter", "select", "where", e.detail.where);
      }
      layer.setDefinitionExpression(e.detail.where);
      dynamicLayer.setLayerDefinitions([e.detail.where]);

      /**
       * Set the map extent to the extent of the currently selected features (if any).
       */
      layer
        .queryExtent(new Query())
        .then((queryExtentResponse: QueryExtentResponse) => {
          const extent = queryExtentResponse.extent;
          if (queryExtentResponse.count && queryExtentResponse.count > 0) {
            map.setExtent(extent);
          }
        });
      createTable();
      // table.grid.refresh();
    });

    // Reset the definition expression to show all rows.
    projectFilter.form.addEventListener("reset", function(e) {
      layer.clearSelection();
      dynamicLayer.setDefaultLayerDefinitions();
      layer.setDefinitionExpression(layer.defaultDefinitionExpression);
      createTable();
      // table.grid.refresh();
    });

    // Add the home button that allows the user to zoom to full extent.
    const homeButton = new HomeButton(
      {
        map
      },
      "homeButton"
    );
    homeButton.startup();

    function createTable() {
      // Destroy existing table.
      if (table) {
        // @ts-ignore
        table.destroyRecursive();
        registry.byId("tablePane").domNode.innerHTML = '<div id="table"></div>';
      }

      /**
       * Resizes the table panel as the table is collapsed or expanded.
       * @param {Event} e - Table close button click event.
       */
      function resizeTablePanel(e: MouseEvent) {
        // @ts-ignore
        const gridHeaderNode = table._gridHeaderNode || table._gridMenu;
        const tableNode = registry.byId("tablePane").domNode;
        const borderContainer = registry.byId("borderContainer");

        const isOpening = (e.target! as Element).classList.contains(
          "toggleClosed"
        );
        if (isOpening) {
          tableNode.style.height = tableNode.dataset.openHeight || "50%";
        } else {
          // Store the old height.
          tableNode.dataset.openHeight =
            tableNode.style.height || [tableNode.clientHeight, "px"].join("");
          // Set to "closed" height.
          tableNode.style.height = [gridHeaderNode.clientHeight, "px"].join("");
        }
        borderContainer.resize();
      }

      // Create the feature table
      table = new FeatureTable(
        {
          map,
          featureLayer: layer,
          outFields,
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
        },
        "table"
      );
      table.startup();

      // event handler setup
      /**
       *
       * @param {DGridRow[]} rows - The rows that were selected
       */
      table.on("row-select", (rows: DGridRow[]) => {
        selectOrDeselectFeatures(rows);
      });

      /**
       *
       * @param {DGridRow[]} rows - The rows that were unselected
       */
      table.on("row-deselect", (rows: DGridRow[]) => {
        selectOrDeselectFeatures(rows, true);
      });

      table.on("refresh", function(e) {
        // Show a modal dialog if all records have been
        // filtered out by the user.
        let dialog;
        // @ts-ignore
        if (e.results && e.results.length <= 0) {
          dialog = document.getElementById(
            "noDataDialog"
          )! as HTMLDialogElement;
          dialog.showModal();
        }
      });

      // resize panel when table close is toggled.
      if ((table as any).tableCloseButton) {
        (table as any).tableCloseButton.addEventListener(
          "click",
          resizeTablePanel
        );
      }
    }

    createTable();

    /**
     * Zooms the map to the extent of the input features
     * @param {external:Graphic[]} features - An array of graphic objects.
     */
    function zoomToFeatures(features: Graphic[]) {
      let geometries;
      // Make sure there actually are features before proceeding.
      if (features && features.length > 0) {
        if (features.length === 1) {
          // If there's only one feature, just zoom to its extent.
          const geometry = features[0].geometry as
            | Polyline
            | Polygon
            | Multipoint;
          map.setExtent(geometry.getExtent(), true);
        } else {
          // Create an array of geometries from the graphics' array.
          geometries = features.map(function(graphic) {
            return graphic.geometry;
          });
          // Union the geometries into a single geometry, then zoom to unioned geometry's extent.
          geometryEngineAsync
            .union(geometries)
            .then(function(unionedGeometry: Polyline | Polygon | Multipoint) {
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
    function selectOrDeselectFeatures(rows: any[], deselect: boolean = false) {
      const selectionMethod = deselect
        ? FeatureLayer.SELECTION_SUBTRACT
        : FeatureLayer.SELECTION_ADD;
      const query = new Query();
      // Convert the array of rows into an array of corresponding object IDs.
      const objectIds = rows.map(function(row) {
        return parseInt(row.id, 10);
      });
      query.objectIds = objectIds;
      return layer.selectFeatures(query, selectionMethod);
    }

    layer.on("selection-complete", function(evt) {
      const { method, target } = evt;
      let { features } = evt;
      features = layer.getSelectedFeatures();
      zoomToFeatures(features);
    });

    const layerListItems = arcgisUtils.getLayerList(response);

    // Custom sort the layer list items array so that the item with the
    // title containing "Planned Projects" is last in the array. Other
    // items will remain in their original order.
    layerListItems.sort(function(a, b) {
      const re = /(?:(?:Planned\s?Projects)|(?:Six-Year\sPlan))/i;
      let output;
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
    const layerList = new LayerList(
      {
        map: response.map,
        layers: layerListItems,
        showLegend: true,
        showOpacitySlider: true,
        showSubLayers: true
      },
      "layerList"
    );
    layerList.startup();

    const basemapGallery = new BasemapGallery(
      {
        map: response.map,
        basemapsGroup: {
          id: "085a9cb0bb664d29bf62b731ccc4aa64"
        },
        basemaps: [(esriBasemaps as any)["wsdot-multilevel"]],
        basemapIds: (esriBasemaps as any)["wsdot-multilevel"].layers.map(
          (l: ILayer) => l.id
        )
      },
      "basemapGallery"
    );
    basemapGallery.startup();

    // Select the default basemap in the gallery.
    basemapGallery.on("load", function() {
      const { basemaps } = basemapGallery;
      if (basemaps && basemaps.length > 0) {
        for (const basemap of basemaps) {
          if (/wsdot[\-\s]?multilevel/i.test(basemap.id)) {
            basemapGallery.select(basemap.id);
            break;
          }
        }
      }
    });

    const legend = new Legend(
      {
        map: response.map,
        layerInfos: arcgisUtils.getLegendLayers(response)
      },
      "legend"
    );
    legend.startup();
  });

function getOperationalLayer(webMapData: IWebmap, opLayerId: string) {
  const opLayers = webMapData.operationalLayers!;
  let opLayer: ILayer | null = null;
  for (const currentLayer of opLayers) {
    if (currentLayer.id === opLayerId) {
      opLayer = currentLayer;
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
(function(url) {
  if (typeof Worker === "undefined") {
    console.log(
      "This browser doesn't support web workers. Some features are not available."
    );
    return;
  }

  // Create the worker.
  const worker = new Worker("QueryWorker.js");

  /**
   * Handles messages from web worker.
   * @param {Event} e - worker message event
   * @param {Object} e.data - Data passed from worker.
   */
  worker.addEventListener("message", function(e) {
    /**
     * Adds values to the datalist corresponding to the given field name.
     * @param {string} fieldName - The name of a field in a map service layer.
     * @param {string[]} values - Values to be added to the datalist.
     */
    function addToDataList(fieldName: string, values: string[]) {
      // var selector = "select[name={fieldName}], datalist[data-field-name='{fieldName}']".replace(/\{fieldName\}/g, fieldName);
      const selector = `select[name=${fieldName}], input[name='${fieldName}']`;

      const datalist = document.querySelector<
        HTMLSelectElement | HTMLInputElement
      >(selector);
      if (datalist) {
        // For select element, add empty element to beginning of options list.
        if (datalist instanceof HTMLSelectElement) {
          const docFrag = document.createDocumentFragment();
          let option = document.createElement("option");
          option.selected = true;
          docFrag.appendChild(option);

          for (const value of values) {
            option = document.createElement("option");
            option.value = value;
            option.textContent = value.toString();
            docFrag.appendChild(option);
          }
          datalist.appendChild(docFrag);
        } else if (datalist instanceof HTMLInputElement) {
          datalist.dataset.list = undefined;
          // @ts-ignore
          autocomplete(
            {
              source: values
            },
            datalist
          );
        }
      } else {
        console.warn(
          `Neither <input> nor <select> found for ${fieldName}.`,
          values
        );
      }
    }

    /**
     * Adds attributes to input elements.
     * @param {Object.<string, Object.<string, string>>} values - Object containing objects containing date representation strings.
     */
    function addAttributes(values: any) {
      for (const fieldName in values) {
        if (values.hasOwnProperty(fieldName)) {
          const value = values[fieldName];
          const selector = "input[type=date][name=" + fieldName + "]";
          const input = document.querySelector(selector);
          if (input) {
            for (const attrName in value) {
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
    const data = e.data;
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
  worker.addEventListener("error", function(e) {
    console.error("worker error: " + e.message || "", e);
  });

  // Send the map service layer URL to the web worker, which will start it processing.
  worker.postMessage({ url });
})(getOperationalLayer(webmapItemData, "PlannedProjects")!.url + "/0");
