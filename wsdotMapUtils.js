define([
    "esri/config",
    "esri/basemaps"
], function (esriConfig, esriBasemaps) {
    /**
     * Provides common configuration options for use in WSDOT web maps.
     * @module wsdotMapUtils
     */

    // Add WSDOT servers to CORS enabled servers.
    ["wsdot.wa.gov", "www.wsdot.wa.gov", "data.wsdot.wa.gov"].forEach(function (server) {
        esriConfig.defaults.io.corsEnabledServers.push(server);
    });

    // Add WSDOT basemap
    esriBasemaps["wsdot-multilevel"] = {
        "id": "wsdot-multilevel",
        "title": "WSDOT Multilevel",
        "thumbnailUrl": "data:image/png;base64,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",
        "layers": [
          {
              "id": "wsdotMultilevel0",
              "url": "http://data.wsdot.wa.gov/arcgis/rest/services/Shared/WebBaseMapWebMercator/MapServer",
              "displayLevels": [0, 1, 2, 3, 4, 5, 6]
          },
          {
              "id": "wsdotMultilevel1",
              "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
              "displayLevels": [0, 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
          },
          {
              "id": "wsdotMultilevel2",
              "url": "http://data.wsdot.wa.gov/arcgis/rest/services/Traffic/LocalRoads/MapServer"
          }
        ]
    };

    var defaultMapOptions = {
        center: [-120.80566406246835, 47.41322033015946],
        zoom: 7,
        minZoom: 0,
        maxZoom: 23,
        basemap: "wsdot-multilevel",
        lods: [
       {
           "level": 0,
           "resolution": 156543.03392800014,
           "scale": 5.91657527591555E8
       },
       {
           "level": 1,
           "resolution": 78271.51696399994,
           "scale": 2.95828763795777E8
       },
       {
           "level": 2,
           "resolution": 39135.75848200009,
           "scale": 1.47914381897889E8
       },
       {
           "level": 3,
           "resolution": 19567.87924099992,
           "scale": 7.3957190948944E7
       },
       {
           "level": 4,
           "resolution": 9783.93962049996,
           "scale": 3.6978595474472E7
       },
       {
           "level": 5,
           "resolution": 4891.96981024998,
           "scale": 1.8489297737236E7
       },
       {
           "level": 6,
           "resolution": 2445.98490512499,
           "scale": 9244648.868618
       },
       {
           "level": 7,
           "resolution": 1222.992452562495,
           "scale": 4622324.434309
       },
       {
           "level": 8,
           "resolution": 611.4962262813797,
           "scale": 2311162.217155
       },
       {
           "level": 9,
           "resolution": 305.74811314055756,
           "scale": 1155581.108577
       },
       {
           "level": 10,
           "resolution": 152.87405657041106,
           "scale": 577790.554289
       },
       {
           "level": 11,
           "resolution": 76.43702828507324,
           "scale": 288895.277144
       },
       {
           "level": 12,
           "resolution": 38.21851414253662,
           "scale": 144447.638572
       },
       {
           "level": 13,
           "resolution": 19.10925707126831,
           "scale": 72223.819286
       },
       {
           "level": 14,
           "resolution": 9.554628535634155,
           "scale": 36111.909643
       },
       {
           "level": 15,
           "resolution": 4.77731426794937,
           "scale": 18055.954822
       },
       {
           "level": 16,
           "resolution": 2.388657133974685,
           "scale": 9027.977411
       },
       {
           "level": 17,
           "resolution": 1.1943285668550503,
           "scale": 4513.988705
       },
       {
           "level": 18,
           "resolution": 0.5971642835598172,
           "scale": 2256.994353
       },
       {
           "level": 19,
           "resolution": 0.29858214164761665,
           "scale": 1128.497176
       },
       {
           "level": 20,
           "resolution": 0.14929107082380833,
           "scale": 564.248588
       },
       {
           "level": 21,
           "resolution": 0.07464553541190416,
           "scale": 282.124294
       },
       {
           "level": 22,
           "resolution": 0.03732276770595208,
           "scale": 141.062147
       },
       {
           "level": 23,
           "resolution": 0.01866138385297604,
           "scale": 70.5310735
       }
        ]
    };

    /**
     * @exports wsdotMapUtils
     */

    return {
        /**
         * @property {Object}
         */
        defaultMapOptions: defaultMapOptions,
        /**
         * @property {Object}
         */
        esriBasemaps: esriBasemaps
    };
});