/*eslint-env worker*/
"use strict";

// Add shim for browsers that don't support Promise. (E.g., IE 11)
if (!this.Promise) {
    self.importScripts("bower_components/core.js/client/core.min.js");
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
    var queryManager, queryRe = /query\/?$/, match;
    if (e.data.url) {
        queryManager = new ProjectQueryManager(e.data.url);


        self.postMessage({ type: "queryTaskCreated", url: queryManager.url });
        // Start the queries, then close this worker when all queries are completed (whether successful or not).
        Promise.all([
            queryManager.queryForDates().then(function (dateRanges) {
                self.postMessage({ ranges: dateRanges });
            }),
            queryManager.queryForUniqueValues("RouteID").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Project_Title").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Sub_Category").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("PIN").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Improvement_Type").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Work_Description").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Sub_Program").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Region").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValues("Program").then(function (values) {
                postUniqueValuesMessage(values);
            }),
            queryManager.queryForUniqueValuesFromCommaDelimted("Congressional_District").then(function (values) {
                postUniqueValuesMessage(values);
            })
        ]).then(function (successResult) {
            self.close();
        }, function (errorResult) {
            self.close();
        });
    }
});