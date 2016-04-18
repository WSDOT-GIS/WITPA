## Modules

<dl>
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
<dt><a href="#objectToQueryString">objectToQueryString(o)</a> ⇒ <code>string</code></dt>
<dd><p>Converts an object into a query string.</p>
</dd>
<dt><a href="#toDateString">toDateString(n)</a> ⇒ <code>string</code></dt>
<dd><p>Converts an integer into a string representation of a date suitable for date input element attributes.</p>
</dd>
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

<a name="objectToQueryString"></a>

## objectToQueryString(o) ⇒ <code>string</code>
Converts an object into a query string.

**Kind**: global function  
**Returns**: <code>string</code> - Returns a query string representation of the input object.  

| Param | Type | Description |
| --- | --- | --- |
| o | <code>Object.&lt;string, (string\|Object)&gt;</code> | An object with query string parameters. |

<a name="toDateString"></a>

## toDateString(n) ⇒ <code>string</code>
Converts an integer into a string representation of a date suitable for date input element attributes.

**Kind**: global function  
**Returns**: <code>string</code> - string representation of the input date value (RFC 3339 format).  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>number</code> | An integer representation of a date. |

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