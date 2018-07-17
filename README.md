WITPA - Washington Interactive Transportation Planning Application
==================================================================

## Development Environment ##

* Node (incliding NPM)
* Visual Studio Code

## Webmap files ##

The map is defined by the `item.json` and `itemdata.json` files in the `webmap` folder.
The format of these files is described in [ArcGIS web map JSON format]. The JSON is passed to
the [esri/arcgis/utils.createMap] function.

## Build process ##

Code is written in TypeScript, then run through Webpack to create the JavaScript files used by the website.

<!--
## jQuery ##

Currently using jQuery 2.1.4 due to [issue with later versions](https://github.com/jquery/jquery/issues/2804).
-->

[ArcGIS web map JSON format]:https://resources.arcgis.com/en/help/arcgis-web-map-json/
[esri/arcgis/utils.createMap]:https://developers.arcgis.com/javascript/3/jsapi/esri.arcgis.utils-amd.html#createmap
