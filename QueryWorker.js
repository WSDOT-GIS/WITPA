/*eslint-env worker*/
"use strict";

var queryTask;

var layerUrl;

/**
 * Converts an object into a query string.
 * @param {Object.<string,(string|Object)>} o - An object with query string parameters.
 * @returns {string} Returns a query string representation of the input object.
 */
function objectToQueryString(o) {
    if (!(o && typeof o === "object")) {
        throw new TypeError("Input parameter should be an object.");
    }

    var output = [], value, name;

    for (name in o) {
        if (o.hasOwnProperty(name)) {
            value = o[name];
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            value = encodeURIComponent(value);
            output.push([name, value].join("="));
        }
    }

    return output.join("&");
}

/**
    * Converts an integer into a string representation of a date suitable for date input element attributes.
    * @param {number} n - An integer representation of a date.
    * @returns {string} string representation of the input date value.
    */
function toDateString(n) {
    var date = new Date(n);
    date = date.toISOString().replace(/T.+$/i, "");
    return date;
}

/**
 * Begins a query for unique values.
 * @param {string} fieldName - The name of a field to get unique values for
 * @param {number} [resultOffset=0] - When a query exceeds the maximum number of records that can be requested from a service, use this value to send another request and start where you left off.
 */
function submitQueryForUniqueValues(fieldName, resultOffset) {
    // http://hqolymgis98d:6080/arcgis/rest/services/TransportationProjects/SixYearPlan/MapServer/0/query?where=PIN+IS+NOT+NULL&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=PIN&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&f=pjson
    var query = {
        where: fieldName + " IS NOT NULL",
        returnGeometry: false,
        orderByFields: fieldName,
        outFields: fieldName,
        returnDistinctValues: true,
        f: "json"
    };
    // Add the result offest parameter if provided and non-zero
    resultOffset = resultOffset || 0;
    if (resultOffset) {
        query.resultOffset = resultOffset;
    }
    var qs = objectToQueryString(query);
    var url = [layerUrl, qs].join("?");

    var request = new XMLHttpRequest();
    request.open("get", url);
    request.onloadend = function (e) {
        var response = e.target.response;
        response = JSON.parse(response);
        var exceededTransferLimit = response.exceededTransferLimit || false;
        // Get just the values.
        var values = response.features.map(function (feature) {
            return feature.attributes[fieldName];
        });

        self.postMessage({
            type: "datalist",
            query: query,
            values: values,
            fieldName: fieldName,
            resultOffset: resultOffset,
            exceededTransferLimit: exceededTransferLimit
        });

        if (exceededTransferLimit) {
            submitQueryForUniqueValues(fieldName, resultOffset + values.length);
        }

    };
    request.send();
}

function submitDatesQuery() {
    var query = {};

    query.where = "Ad_Date IS NOT NULL";
    query.f = "json";
    // Create array of objects, then convert them to StatisticsDefinition objects.
    query.outStatistics = [
        {
            statisticType: "min",
            onStatisticField: "Ad_Date",
            outStatisticFieldName: "Min_Ad_Date"
        },
        {
            statisticType: "min",
            onStatisticField: "OC_Date",
            outStatisticFieldName: "Min_OC_Date"
        },
        {
            statisticType: "min",
            onStatisticField: "PE_Start_Date",
            outStatisticFieldName: "Min_PE_Start_Date"
        },
        {
            statisticType: "max",
            onStatisticField: "Ad_Date",
            outStatisticFieldName: "Max_Ad_Date"
        },
        {
            statisticType: "max",
            onStatisticField: "OC_Date",
            outStatisticFieldName: "Max_OC_Date"
        },
        {
            statisticType: "max",
            onStatisticField: "PE_Start_Date",
            outStatisticFieldName: "Max_PE_Start_Date"
        }
    ];

    var qs = objectToQueryString(query);
    var url = [layerUrl, qs].join("?");

    var request = new XMLHttpRequest();
    request.open("get", url);
    request.onloadend = function (e) {
        var queryResponse = e.target.response;
        queryResponse = JSON.parse(queryResponse, function (k, v) {
            var dateFieldNameRe = /Date$/i;
            if (dateFieldNameRe.test(k) && typeof v === "number") {
                return toDateString(v);
            } else {
                return v;
            }
        });
        var values = queryResponse.features[0].attributes;


        // Create a list of field ranges.
        var ranges = {
            Ad_Date: { min: values.Min_Ad_Date, max: values.Max_Ad_Date },
            OC_Date: { min: values.Min_OC_Date, max: values.Max_OC_Date },
            PE_Start_Date: { min: values.Min_PE_Start_Date, max: values.Max_PE_Start_Date }
        };

        self.postMessage({
            type: "date ranges",
            ranges: ranges
        });
    };
    request.send();

}

self.addEventListener("error", function (err) {
    self.postMessage({ error: err });
});

self.addEventListener("message", function (e) {
    var queryRe = /query\/?$/, match;
    if (e.data.url) {
        layerUrl = e.data.url;
        // Add the "query" part to the URL if not already present.
        match = layerUrl.match(queryRe);
        if (!match) {
            layerUrl = layerUrl.replace(/\/?$/, "/query");
        }
        self.postMessage({ type: "queryTaskCreated", url: layerUrl });
        submitDatesQuery();
        submitQueryForUniqueValues("PIN");
        submitQueryForUniqueValues("Project_Title");
        submitQueryForUniqueValues("Route");
    }
});