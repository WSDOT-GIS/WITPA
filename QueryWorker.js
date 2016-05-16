/*eslint-env worker*/
"use strict";

// Add shim for browsers that don't support Promise. (E.g., IE 11)
if (!this.Promise) {
    self.importScripts("bower_components/core.js/client/core.min.js");
}

if (!this.fetch) {
    self.importScripts("bower_components/fetch/fetch.js")
}

self.importScripts("conversionUtils.js");
self.importScripts("ProjectQueryManager.js");


self.addEventListener("error", function (err) {
    self.postMessage({ error: err });
});

function postUniqueValuesMessage(response) {
    self.postMessage(response);
}

self.addEventListener("message", function (e) {
    var queryManager, queryRe = /query\/?$/, match, promises, datePromise, fieldPromises, numberListPromises;
    var uniqueValueFieldNames = [
        "RouteID",
        "Project_Title",
        "Sub_Category", "PIN",
        "Improvement_Type",
        "Work_Description",
        "Sub_Program",
        "Region",
        "Program"
    ];
    var numberListFieldNames = [
        "Congressional_District"
    ];
    if (e.data.url) {
        // Start the queries, then close this worker when all queries are completed (whether successful or not).

        queryManager = new ProjectQueryManager(e.data.url);
        self.postMessage({ type: "queryTaskCreated", url: queryManager.url });
        datePromise = queryManager.queryForDates();
        datePromise.then(function (dateRanges) {
            self.postMessage({ ranges: dateRanges });
        });

        numberListPromises = numberListFieldNames.map(function (fieldName) {
            return queryManager.queryForUniqueValuesFromCommaDelimted(fieldName).then(function (values) {
                postUniqueValuesMessage(values);
            });
        });

        fieldPromises = uniqueValueFieldNames.map(function (fieldName) {
            return queryManager.queryForUniqueValues(fieldName).then(function (values) {
                postUniqueValuesMessage(values);
            })
        });

        promises = [datePromise].concat(numberListPromises).concat(fieldPromises);

        Promise.all(promises).then(function (successResult) {
            self.close();
        }, function (errorResult) {
            self.close();
        });
    }
});