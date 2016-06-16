WITPA - Washington Interactive Transportation Planning Application
==================================================================

## Development Environment ##

*Visual Studio 2015*

Enterprise edition is used for development, but other editions (e.g., Community) would probably work as well.

### Recommended extensions ###

* [Web Essentials 2015]
* [Web Analyzer]
* [Bundler & Minifier]

## Webmap files ##

The map is defined by the `item.json` and `itemdata.json` files in the `webmap` folder. 
The format of these files is described in [ArcGIS web map JSON format]. These files are
imported via the [dojo/text] AMD plugin, parsed to JSON, and then the JSON is passed to
the [esri/arcgis/utils.createMap] function.

## jQuery ## 

Currently using jQuery 2.1.4 due to [issue with later versions](https://github.com/jquery/jquery/issues/2804).

[ArcGIS web map JSON format]:http://resources.arcgis.com/en/help/arcgis-web-map-json/
[Bundler & Minifier]:https://visualstudiogallery.msdn.microsoft.com/9ec27da7-e24b-4d56-8064-fd7e88ac1c40
[dojo/text]:https://dojotoolkit.org/reference-guide/dojo/text.html
[esri/arcgis/utils.createMap]:https://developers.arcgis.com/javascript/3/jsapi/esri.arcgis.utils-amd.html#createmap
[Web Analyzer]:https://visualstudiogallery.msdn.microsoft.com/6edc26d4-47d8-4987-82ee-7c820d79be1d
[Web Essentials 2015]:http://vswebessentials.com/
