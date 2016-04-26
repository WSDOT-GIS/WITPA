/*eslint-env worker*/
"use strict";

var queryTask;
var layerUrl;

// Add shim for browsers that don't support Promise. (E.g., IE 11)
if (!this.Promise) {
    self.importScripts("bower_components/core.js/client/core.min.js");
}

/**
 * Converts the arrays of comma-separated number strings array of numbers.
 * @param {string[]} response - The response from a map service layer query.
 * @return {number[]} - An array of distinct numbers parsed from the input string.
 * @example
 * var input = [" ","01, 02","01, 02, 09","01, 04, 08","01, 06, 07, 09","01, 07","01, 08","01, 09","02, 06","02, 07","03, 04","03, 06","03, 06, 10","03, 08, 10","03, 10","04, 05","04, 08","06, 09","06, 09, 10","06, 10","07, 08","07, 09","08, 09","08, 09, 10","08, 10","09, 10","1","10","2","3","4","5","6","7","8","9"];
 * var output = listStringsToNumberArray(input);
 * // Output equals [1,2,3,4,5,6,7,8,9,10]
 */
function listStringsToNumberArray(values) {
    var s = new Set();
    values.forEach(function (str) {
        str.split(",", true).forEach(function (item) {
            s.add(Number(item));
        });
    });

    var compareNumbers = function (a, b) {
        return a === b ? 0 : a > b ? 1 : -1;
    };

    return Array.from(s).sort(compareNumbers);
}

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
 * @returns {string} string representation of the input date value (RFC 3339 format).
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
 * @param {Array.<string>} [previousValues=undefined] - When multiple queries are required to get all records, use this value to pass the previous queries' results.
 * @returns {Promise.<Object.<string, (boolean|string[])>>} Values returned from the query.
 */
function submitQueryForUniqueValues(fieldName, resultOffset, previousValues) {
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

    return new Promise(function (resolve, reject) {

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

            // Combine previous values with values from current query.
            values = previousValues ? previousValues.concat(values) : values;

            if (exceededTransferLimit) {
                // If the query exceeded the amount of returned records for the service, submit a new query.
                submitQueryForUniqueValues(fieldName, resultOffset + values.length, values).then(function (resultPromise) {
                    if (resultPromise && resultPromise.complete) {
                        resolve(resultPromise);
                    }
                }, function (err) {
                    reject(err);
                });
            } else {
                resolve({
                    values: values,
                    complete: true
                });
            }

        };
        request.send();
    });
}

function submitQueryForUniqueValuesFromCommaDelimted(fieldName) {
    return new Promise(function (resolve, reject) {
        submitQueryForUniqueValues(fieldName).then(function (response) {
            response.values = listStringsToNumberArray(response.values);
            resolve(response);
            self.postMessage({
                type: "datalist",
                fieldName: fieldName,
                values: response.values
            })
        });
    });
}

/**
 * @typedef DateRange
 * @property {string} min - Minimum date
 * @property {string} max - Maximum date
 */

/**
 * Starts the query for min and max date values.
 * @returns {Promise.<Object.<string, DateRange>>} A promise returning the min and max date values for date fields.
 */
function submitDatesQuery() {
    return new Promise(function (resolve, reject) {
        var query = {};

        query.where = "Advertisement_Date IS NOT NULL";
        query.f = "json";
        // Create array of objects, then convert them to StatisticsDefinition objects.
        query.outStatistics = [
            {
                statisticType: "min",
                onStatisticField: "Advertisement_Date",
                outStatisticFieldName: "Min_Ad_Date"
            },
            {
                statisticType: "min",
                onStatisticField: "Operationally_Complete",
                outStatisticFieldName: "Min_OC_Date"
            },
            {
                statisticType: "min",
                onStatisticField: "Begin_Preliminary_Engineering",
                outStatisticFieldName: "Min_PE_Start_Date"
            },
            {
                statisticType: "max",
                onStatisticField: "Advertisement_Date",
                outStatisticFieldName: "Max_Ad_Date"
            },
            {
                statisticType: "max",
                onStatisticField: "Operationally_Complete",
                outStatisticFieldName: "Max_OC_Date"
            },
            {
                statisticType: "max",
                onStatisticField: "Begin_Preliminary_Engineering",
                outStatisticFieldName: "Max_PE_Start_Date"
            }
        ];

        var qs = objectToQueryString(query);
        var url = [layerUrl, qs].join("?");

        var request = new XMLHttpRequest();
        request.open("get", url);
        request.onloadend = function (e) {
            var queryResponse;

            if (e.target.status !== 200) {
                reject({ response: e.target.response, status: e.target.status });
                return;
            }

            // Get the HTTP response.
            queryResponse = e.target.response;

            // Convert the response text into an object.
            // Convert date values to
            queryResponse = JSON.parse(queryResponse, function (k, v) {
                var dateFieldNameRe = /Date$/i;
                if (dateFieldNameRe.test(k) && typeof v === "number") {
                    return toDateString(v);
                } else {
                    return v;
                }
            });

            if (queryResponse.error) {
                reject(queryResponse);
                return;
            }

            var values = queryResponse.features[0].attributes;


            // Create a list of field ranges.
            var ranges = {
                Advertisement_Date: { min: values.Min_Ad_Date, max: values.Max_Ad_Date },
                Operationally_Complete: { min: values.Min_OC_Date, max: values.Max_OC_Date },
                Begin_Preliminary_Engineering: { min: values.Min_PE_Start_Date, max: values.Max_PE_Start_Date }
            };

            self.postMessage({
                type: "date ranges",
                ranges: ranges
            });

            resolve(ranges);
        };
        request.send();
    });

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
        // Start the queries, then close this worker when all queries are completed (whether successful or not).
        Promise.all([
            submitDatesQuery(),
            submitQueryForUniqueValues("RouteID"),
            submitQueryForUniqueValues("Project_Title"),
            submitQueryForUniqueValues("Sub_Category"),
            submitQueryForUniqueValues("PIN"),
            submitQueryForUniqueValues("Improvement_Type"),
            submitQueryForUniqueValues("Work_Description"),
            submitQueryForUniqueValues("Sub_Program"),
            submitQueryForUniqueValues("Region"),
            submitQueryForUniqueValues("Program"),
            submitQueryForUniqueValuesFromCommaDelimted("Congressional_District"),
        ]).then(function (successResult) {
            self.close();
        }, function (errorResult) {
            self.close();
        });
    }
});