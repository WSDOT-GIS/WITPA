## Modules

<dl>
<dt><a href="#module_conversionUtils">conversionUtils</a></dt>
<dd></dd>
<dt><a href="#module_infoWindowUtils">infoWindowUtils</a></dt>
<dd></dd>
<dt><a href="#module_ProjectFilter">ProjectFilter</a></dt>
<dd><p>A module that creates a filter UI for projects.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#target">target</a> : <code>Array.&lt;Graphic&gt;</code></dt>
<dd><p>FeatureLayer.selection-complete</p>
</dd>
<dt><a href="#defaultMapOptions">defaultMapOptions</a></dt>
<dd></dd>
<dt><a href="#esriBasemaps">esriBasemaps</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#submitQueryForUniqueValues">submitQueryForUniqueValues(fieldName, [resultOffset], [previousValues])</a> ⇒ <code>Promise.&lt;Object.&lt;string, (boolean|Array.&lt;string&gt;)&gt;&gt;</code></dt>
<dd><p>Begins a query for unique values.</p>
</dd>
<dt><a href="#submitDatesQuery">submitDatesQuery()</a> ⇒ <code>Promise.&lt;Object.&lt;string, DateRange&gt;&gt;</code></dt>
<dd><p>Starts the query for min and max date values.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DateRange">DateRange</a></dt>
<dd></dd>
<dt><a href="#DGridRow">DGridRow</a> : <code>Object</code></dt>
<dd></dd>
</dl>

## External

<dl>
<dt><a href="#external_dojo/Deferred">dojo/Deferred</a></dt>
<dd><p>Deferred response from an asynchronous operation.</p>
</dd>
<dt><a href="#external_HTMLFormElement">HTMLFormElement</a></dt>
<dd><p>HTML Form Element</p>
</dd>
</dl>

<a name="module_conversionUtils"></a>

## conversionUtils

* [conversionUtils](#module_conversionUtils)
    * [.listStringsToNumberArray(response)](#module_conversionUtils.listStringsToNumberArray) ⇒ <code>Array.&lt;number&gt;</code>
    * [.objectToQueryString(o)](#module_conversionUtils.objectToQueryString) ⇒ <code>string</code>
    * [.toRfc3339(n)](#module_conversionUtils.toRfc3339) ⇒ <code>string</code>

<a name="module_conversionUtils.listStringsToNumberArray"></a>

### conversionUtils.listStringsToNumberArray(response) ⇒ <code>Array.&lt;number&gt;</code>
Converts the arrays of comma-separated number strings array of numbers.

**Kind**: static method of <code>[conversionUtils](#module_conversionUtils)</code>  
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

**Kind**: static method of <code>[conversionUtils](#module_conversionUtils)</code>  
**Returns**: <code>string</code> - Returns a query string representation of the input object.  

| Param | Type | Description |
| --- | --- | --- |
| o | <code>Object.&lt;string, \*&gt;</code> | An object with query string parameters. |

<a name="module_conversionUtils.toRfc3339"></a>

### conversionUtils.toRfc3339(n) ⇒ <code>string</code>
Converts an integer into a string representation of a date suitable for date input element attributes.

**Kind**: static method of <code>[conversionUtils](#module_conversionUtils)</code>  
**Returns**: <code>string</code> - string representation of the input date value ([RFC 3339 format](https://tools.ietf.org/html/rfc3339)).  
**Throws**:

- <code>TypeError</code> - Thrown if the input parameter is not a valid Date or integer.


| Param | Type | Description |
| --- | --- | --- |
| n | <code>Date</code> &#124; <code>number</code> | An integer representation of a date. |

**Example**  
```js
var d = new Date(2016, 4, 26);var s = conversionUtils.toRfc3339(d);// Jasmine testexpect(s).toBe("2016-05-26");
```
<a name="module_infoWindowUtils"></a>

## infoWindowUtils
<a name="exp_module_infoWindowUtils--makeInfoWindowDraggable"></a>

### makeInfoWindowDraggable ⏏
Makes an InfoWindow draggable.

**Kind**: Exported member  

| Param | Type | Description |
| --- | --- | --- |
| infoWindow | <code>external:esri/dijit/InfoWindow</code> | An info window. |

<a name="module_ProjectFilter"></a>

## ProjectFilter
A module that creates a filter UI for projects.


* [ProjectFilter](#module_ProjectFilter)
    * [ProjectFilter](#exp_module_ProjectFilter--ProjectFilter) ⏏
        * [.form](#module_ProjectFilter--ProjectFilter+form) : <code>[HTMLFormElement](#external_HTMLFormElement)</code>
        * ["submit-query"](#module_ProjectFilter--ProjectFilter+event_submit-query)

<a name="exp_module_ProjectFilter--ProjectFilter"></a>

### ProjectFilter ⏏
**Kind**: Exported class  
<a name="module_ProjectFilter--ProjectFilter+form"></a>

#### projectFilter.form : <code>[HTMLFormElement](#external_HTMLFormElement)</code>
The HTML form

**Kind**: instance property of <code>[ProjectFilter](#exp_module_ProjectFilter--ProjectFilter)</code>  
**Emits**: <code>{module:ProjectFilter#event:submit-query}</code>  
<a name="module_ProjectFilter--ProjectFilter+event_submit-query"></a>

#### "submit-query"
Submit query event

**Kind**: event emitted by <code>[ProjectFilter](#exp_module_ProjectFilter--ProjectFilter)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| detail | <code>Object</code> | Details about the submitted query |
| detail.where | <code>string</code> | The where clause to use with a filter |

<a name="target"></a>

## target : <code>Array.&lt;Graphic&gt;</code>
FeatureLayer.selection-complete

**Kind**: global variable  
**See**: [https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#event-selection-complete](https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#event-selection-complete)  
<a name="defaultMapOptions"></a>

## defaultMapOptions
**Kind**: global variable  
**Properties**

| Type |
| --- |
| <code>Object</code> | 

<a name="esriBasemaps"></a>

## esriBasemaps
**Kind**: global variable  
**Properties**

| Type |
| --- |
| <code>Object</code> | 

<a name="submitQueryForUniqueValues"></a>

## submitQueryForUniqueValues(fieldName, [resultOffset], [previousValues]) ⇒ <code>Promise.&lt;Object.&lt;string, (boolean\|Array.&lt;string&gt;)&gt;&gt;</code>
Begins a query for unique values.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object.&lt;string, (boolean\|Array.&lt;string&gt;)&gt;&gt;</code> - Values returned from the query.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fieldName | <code>string</code> |  | The name of a field to get unique values for |
| [resultOffset] | <code>number</code> | <code>0</code> | When a query exceeds the maximum number of records that can be requested from a service, use this value to send another request and start where you left off. |
| [previousValues] | <code>Array.&lt;string&gt;</code> |  | When multiple queries are required to get all records, use this value to pass the previous queries' results. |

<a name="submitDatesQuery"></a>

## submitDatesQuery() ⇒ <code>Promise.&lt;Object.&lt;string, DateRange&gt;&gt;</code>
Starts the query for min and max date values.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object.&lt;string, DateRange&gt;&gt;</code> - A promise returning the min and max date values for date fields.  
<a name="DateRange"></a>

## DateRange
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| min | <code>string</code> | Minimum date |
| max | <code>string</code> | Maximum date |

<a name="DGridRow"></a>

## DGridRow : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> |  |
| data.OBJECTID | <code>number</code> |  |
| element | <code>HTMLElement</code> |  |
| id | <code>string</code> | A string containing the corresponding feature's Object ID. |

<a name="external_dojo/Deferred"></a>

## dojo/Deferred
Deferred response from an asynchronous operation.

**Kind**: global external  
**See**: [dojo/Deferred](http://dojotoolkit.org/reference-guide/1.10/dojo/Deferred.html)  
<a name="external_HTMLFormElement"></a>

## HTMLFormElement
HTML Form Element

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement)  
