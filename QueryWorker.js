/*eslint-env worker*/
"use strict";

var queryTask;
var layerUrl;

// Add shim for browsers that don't support Promise. (E.g., IE 11)
if (!this.Promise) {
    self.importScripts("bower_components/core.js/client/core.min.js");
}

self.importScripts("conversionUtils.js");

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
    var qs = conversionUtils.objectToQueryString(query);
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
            response.values = conversionUtils.listStringsToNumberArray(response.values);
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

        var qs = conversionUtils.objectToQueryString(query);
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
                    return conversionUtils.toDateString(v);
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