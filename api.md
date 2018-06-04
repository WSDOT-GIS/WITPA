## Modules

<dl>
<dt><a href="#module_ProjectFilter">ProjectFilter</a></dt>
<dd><p>A module that creates a filter UI for projects.</p>
</dd>
<dt><a href="#module_ProjectQueryManager">ProjectQueryManager</a></dt>
<dd><p>Manages queries to the projects layer.</p>
</dd>
<dt><a href="#module_conversionUtils">conversionUtils</a></dt>
<dd><p>Utility module that provides conversion functions.</p>
</dd>
<dt><a href="#module_infoWindowUtils">infoWindowUtils</a></dt>
<dd><p>Utilites for use with <a href="#external_esri/dijit/InfoWindow">esri/dijit/InfoWindow</a> objects.</p>
</dd>
<dt><a href="#module_wsdotMapUtils">wsdotMapUtils</a></dt>
<dd><p>Provides common configuration options for use in WSDOT web maps.</p>
<p>Adds &quot;wsdot.wa.gov&quot;, &quot;<a href="http://www.wsdot.wa.gov&quot;">www.wsdot.wa.gov&quot;</a>, and &quot;data.wsdot.wa.gov&quot;
to the ArcGIS API&#39;s list of <a href="https://developers.arcgis.com/javascript/jshelp/inside_defaults.html#corsEnabledServers">CORS enabled servers</a>.</p>
<p>Adds the WSDOT Multilevel basemap.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DateRange">DateRange</a> : <code>Object.&lt;string, Date&gt;</code></dt>
<dd></dd>
<dt><a href="#DateRangeResponse">DateRangeResponse</a> : <code>Object.&lt;string, DateRange&gt;</code></dt>
<dd></dd>
<dt><a href="#UniqueValuesQueryResponse">UniqueValuesQueryResponse</a> : <code>Object</code></dt>
<dd></dd>
</dl>

## External

<dl>
<dt><a href="#external_TypeError">TypeError</a></dt>
<dd><p>The TypeError object represents an error when a value is not of the expected type.</p>
</dd>
<dt><a href="#external_esri/dijit/InfoWindow">esri/dijit/InfoWindow</a></dt>
<dd><p>ArcGIS API InfoWindow</p>
</dd>
<dt><a href="#external_HTMLFormElement">HTMLFormElement</a></dt>
<dd><p>HTML Form Element</p>
</dd>
<dt><a href="#external_CustomEvent">CustomEvent</a></dt>
<dd><p>CustomEvent</p>
</dd>
<dt><a href="#external_FeatureTable">FeatureTable</a></dt>
<dd><p>Feature Table</p>
</dd>
</dl>

<a name="module_ProjectFilter"></a>

## ProjectFilter
A module that creates a filter UI for projects.


* [ProjectFilter](#module_ProjectFilter)
    * [ProjectFilter](#exp_module_ProjectFilter--ProjectFilter) ⏏
        * [.form](#module_ProjectFilter--ProjectFilter+form) : [<code>HTMLFormElement</code>](#external_HTMLFormElement)
        * ["submit-query"](#module_ProjectFilter--ProjectFilter+event_submit-query)

<a name="exp_module_ProjectFilter--ProjectFilter"></a>

### ProjectFilter ⏏
**Kind**: Exported class  
<a name="module_ProjectFilter--ProjectFilter+form"></a>

#### projectFilter.form : [<code>HTMLFormElement</code>](#external_HTMLFormElement)
The HTML form

**Kind**: instance property of [<code>ProjectFilter</code>](#exp_module_ProjectFilter--ProjectFilter)  
**Emits**: [<code>submit-query</code>](#module_ProjectFilter--ProjectFilter+event_submit-query)  
<a name="module_ProjectFilter--ProjectFilter+event_submit-query"></a>

#### "submit-query"
Submit query event

**Kind**: event emitted by [<code>ProjectFilter</code>](#exp_module_ProjectFilter--ProjectFilter)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| detail | <code>Object</code> | Details about the submitted query |
| detail.where | <code>string</code> | The where clause to use with a filter |

<a name="module_ProjectQueryManager"></a>

## ProjectQueryManager
Manages queries to the projects layer.


* [ProjectQueryManager](#module_ProjectQueryManager)
    * [ProjectQueryManager](#exp_module_ProjectQueryManager--ProjectQueryManager) ⏏
        * [new ProjectQueryManager(url)](#new_module_ProjectQueryManager--ProjectQueryManager_new)
        * _instance_
            * [.queryForUniqueValues(fieldName, [resultOffset], [previousValues])](#module_ProjectQueryManager--ProjectQueryManager+queryForUniqueValues) ⇒ [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse)
            * [.queryForUniqueValuesFromCommaDelimted(fieldName)](#module_ProjectQueryManager--ProjectQueryManager+queryForUniqueValuesFromCommaDelimted) ⇒ [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse)
            * [.queryForDates()](#module_ProjectQueryManager--ProjectQueryManager+queryForDates) ⇒ [<code>Promise.&lt;DateRangeResponse&gt;</code>](#DateRangeResponse)
        * _inner_
            * [~url](#module_ProjectQueryManager--ProjectQueryManager..url) : <code>string</code>

<a name="exp_module_ProjectQueryManager--ProjectQueryManager"></a>

### ProjectQueryManager ⏏
**Kind**: Exported class  
<a name="new_module_ProjectQueryManager--ProjectQueryManager_new"></a>

#### new ProjectQueryManager(url)

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL to a map service or feature service layer. |

<a name="module_ProjectQueryManager--ProjectQueryManager+queryForUniqueValues"></a>

#### projectQueryManager.queryForUniqueValues(fieldName, [resultOffset], [previousValues]) ⇒ [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse)
Begins a query for unique values.

**Kind**: instance method of [<code>ProjectQueryManager</code>](#exp_module_ProjectQueryManager--ProjectQueryManager)  
**Returns**: [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse) - Values returned from the query.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fieldName | <code>string</code> |  | The name of a field to get unique values for |
| [resultOffset] | <code>number</code> | <code>0</code> | When a query exceeds the maximum number of records that can be requested from a service, use this value to send another request and start where you left off. |
| [previousValues] | <code>Array.&lt;string&gt;</code> |  | When multiple queries are required to get all records, use this value to pass the previous queries' results. |

<a name="module_ProjectQueryManager--ProjectQueryManager+queryForUniqueValuesFromCommaDelimted"></a>

#### projectQueryManager.queryForUniqueValuesFromCommaDelimted(fieldName) ⇒ [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse)
Queries a layer for all of the unique integer values contained in a field which containscomma-delmited lists of integers.

**Kind**: instance method of [<code>ProjectQueryManager</code>](#exp_module_ProjectQueryManager--ProjectQueryManager)  
**Returns**: [<code>Promise.&lt;UniqueValuesQueryResponse&gt;</code>](#UniqueValuesQueryResponse) - Values returned from the query.  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | <code>string</code> | The name of the field to query. |

<a name="module_ProjectQueryManager--ProjectQueryManager+queryForDates"></a>

#### projectQueryManager.queryForDates() ⇒ [<code>Promise.&lt;DateRangeResponse&gt;</code>](#DateRangeResponse)
Starts the query for min and max date values.

**Kind**: instance method of [<code>ProjectQueryManager</code>](#exp_module_ProjectQueryManager--ProjectQueryManager)  
**Returns**: [<code>Promise.&lt;DateRangeResponse&gt;</code>](#DateRangeResponse) - A promise returning the min and max date values for date fields.  
<a name="module_ProjectQueryManager--ProjectQueryManager..url"></a>

#### ProjectQueryManager~url : <code>string</code>
The URL to the feature layer.

**Kind**: inner property of [<code>ProjectQueryManager</code>](#exp_module_ProjectQueryManager--ProjectQueryManager)  
**Read only**: true  
<a name="module_conversionUtils"></a>

## conversionUtils
Utility module that provides conversion functions.


* [conversionUtils](#module_conversionUtils)
    * [.listStringsToNumberArray(response)](#module_conversionUtils.listStringsToNumberArray) ⇒ <code>Array.&lt;number&gt;</code>
    * [.objectToQueryString(o)](#module_conversionUtils.objectToQueryString) ⇒ <code>string</code>
    * [.toRfc3339(date)](#module_conversionUtils.toRfc3339) ⇒ <code>string</code>

<a name="module_conversionUtils.listStringsToNumberArray"></a>

### conversionUtils.listStringsToNumberArray(response) ⇒ <code>Array.&lt;number&gt;</code>
Converts the arrays of comma-separated number strings array of numbers.

**Kind**: static method of [<code>conversionUtils</code>](#module_conversionUtils)  
**Returns**: <code>Array.&lt;number&gt;</code> - - An array of distinct numbers parsed from the input string.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>Array.&lt;string&gt;</code> | The response from a map service layer query. |

**Example**  
```js
var input = [" ","01, 02","01, 02, 09","01, 04, 08","01, 06, 07, 09","01, 07","01, 08","01, 09","02, 06","02, 07","03, 04","03, 06","03, 06, 10","03, 08, 10","03, 10","04, 05","04, 08","06, 09","06, 09, 10","06, 10","07, 08","07, 09","08, 09","08, 09, 10","08, 10","09, 10","1","10","2","3","4","5","6","7","8","9"];var output = listStringsToNumberArray(input);// Output equals [1,2,3,4,5,6,7,8,9,10]
```
<a name="module_conversionUtils.objectToQueryString"></a>

### conversionUtils.objectToQueryString(o) ⇒ <code>string</code>
Converts an object into a query string.

**Kind**: static method of [<code>conversionUtils</code>](#module_conversionUtils)  
**Returns**: <code>string</code> - Returns a query string representation of the input object.  
**Throws**:

- [<code>TypeError</code>](#external_TypeError) - Throws a type error if the input is not an object.


| Param | Type | Description |
| --- | --- | --- |
| o | <code>Object.&lt;string, \*&gt;</code> | An object with query string parameters. |

<a name="module_conversionUtils.toRfc3339"></a>

### conversionUtils.toRfc3339(date) ⇒ <code>string</code>
Converts an integer into a string representation of a date suitable for date input element attributes.

**Kind**: static method of [<code>conversionUtils</code>](#module_conversionUtils)  
**Returns**: <code>string</code> - string representation of the input date value ([RFC 3339 format](https://tools.ietf.org/html/rfc3339)).  
**Throws**:

- [<code>TypeError</code>](#external_TypeError) - Thrown if the input parameter is not a valid Date or integer.


| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> \| <code>number</code> | An integer representation of a date. |

**Example**  
```js
var d = new Date(2016, 4, 26);var s = conversionUtils.toRfc3339(d);// Jasmine testexpect(s).toBe("2016-05-26");
```
<a name="module_infoWindowUtils"></a>

## infoWindowUtils
Utilites for use with [esri/dijit/InfoWindow](#external_esri/dijit/InfoWindow) objects.

<a name="module_infoWindowUtils.makeInfoWindowDraggable"></a>

### infoWindowUtils.makeInfoWindowDraggable(infoWindow)
Makes an InfoWindow draggable.

**Kind**: static method of [<code>infoWindowUtils</code>](#module_infoWindowUtils)  

| Param | Type | Description |
| --- | --- | --- |
| infoWindow | [<code>esri/dijit/InfoWindow</code>](#external_esri/dijit/InfoWindow) | An info window. |

<a name="module_wsdotMapUtils"></a>

## wsdotMapUtils
Provides common configuration options for use in WSDOT web maps.Adds "wsdot.wa.gov", "www.wsdot.wa.gov", and "data.wsdot.wa.gov"to the ArcGIS API's list of [CORS enabled servers](https://developers.arcgis.com/javascript/jshelp/inside_defaults.html#corsEnabledServers).Adds the WSDOT Multilevel basemap.


* [wsdotMapUtils](#module_wsdotMapUtils)
    * [.esriBasemaps](#module_wsdotMapUtils.esriBasemaps) : [<code>esri/basemaps</code>](https://developers.arcgis.com/javascript/3/jsapi/esri.basemaps-amd.html)
    * [.defaultMapOptions](#module_wsdotMapUtils.defaultMapOptions) : <code>Object</code>

<a name="module_wsdotMapUtils.esriBasemaps"></a>

### wsdotMapUtils.esriBasemaps : [<code>esri/basemaps</code>](https://developers.arcgis.com/javascript/3/jsapi/esri.basemaps-amd.html)
**Kind**: static property of [<code>wsdotMapUtils</code>](#module_wsdotMapUtils)  
<a name="module_wsdotMapUtils.defaultMapOptions"></a>

### wsdotMapUtils.defaultMapOptions : <code>Object</code>
**Kind**: static property of [<code>wsdotMapUtils</code>](#module_wsdotMapUtils)  
**See**: [esri/Map constructor options](https://developers.arcgis.com/javascript/3/jsapi/map-amd.html#map1)  
<a name="DateRange"></a>

## DateRange : <code>Object.&lt;string, Date&gt;</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| min | <code>Date</code> | Minimum date |
| max | <code>Date</code> | Maximum date |

<a name="DateRangeResponse"></a>

## DateRangeResponse : <code>Object.&lt;string, DateRange&gt;</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Advertisement_Date | [<code>DateRange</code>](#DateRange) | Advertisement_Date |
| Operationally_Complete | [<code>DateRange</code>](#DateRange) | Operationally_Complete |
| Begin_Preliminary_Engineering | [<code>DateRange</code>](#DateRange) | Begin_Preliminary_Engineering |

<a name="UniqueValuesQueryResponse"></a>

## UniqueValuesQueryResponse : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| fieldName | <code>string</code> | The field name that the unique values correspond to. |
| values | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;number&gt;</code> | An array of either string or number values. |
| complete | <code>Boolean</code> | Indicates that the values list is complete. Used by recursive calls for when the number of features that is allowed to be returned is less than the total number of unique features. |

<a name="external_TypeError"></a>

## TypeError
The TypeError object represents an error when a value is not of the expected type.

**Kind**: global external  
**See**: [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)  
<a name="external_esri/dijit/InfoWindow"></a>

## esri/dijit/InfoWindow
ArcGIS API InfoWindow

**Kind**: global external  
**See**: [InfoWindow](https://developers.arcgis.com/javascript/3/jsapi/infowindow-amd.html)  
<a name="external_HTMLFormElement"></a>

## HTMLFormElement
HTML Form Element

**Kind**: global external  
**See**: [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement)  
<a name="external_CustomEvent"></a>

## CustomEvent
CustomEvent

**Kind**: global external  
**See**: [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)  
<a name="external_FeatureTable"></a>

## FeatureTable
Feature Table

**Kind**: global external  
**See**: [FeatureTable](https://developers.arcgis.com/javascript/3/jsapi/featuretable-amd.html)  
