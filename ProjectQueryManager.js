/**
 * @typedef {Object.<string, Date>} DateRange
 * @property {Date} min - Minimum date
 * @property {Date} max - Maximum date
 */

/**
 * @typedef {Object.<string, DateRange>} DateRangeResponse
 * @property {DateRange} Advertisement_Date - Advertisement_Date
 * @property {DateRange} Operationally_Complete - Operationally_Complete
 * @property {DateRange} Begin_Preliminary_Engineering - Begin_Preliminary_Engineering
 */

/**
 * @typedef {Object} UniqueValuesQueryResponse
 * @property {string} fieldName - The field name that the unique values correspond to.
 * @property {(string[]|number[])} values - An array of either string or number values.
 * @property {Boolean} complete - Indicates that the values list is complete.
 * Used by recursive calls for when the number of features that is allowed to be returned
 * is less than the total number of unique features.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./conversionUtils'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./conversionUtils.js'));
    } else {
        // Browser globals (root is window)
        root.ProjectQueryManager = factory(root.conversionUtils);
    }
}(this, function (conversionUtils) {
    "use strict";

    /**
     * Manages queries to the projects layer.
     * @module ProjectQueryManager
     */

    /**
     * @alias module:ProjectQueryManager
     * @class
     * @param {string} url - URL to a map service or feature service layer.
     */
    function ProjectQueryManager(url) {
        var queryRe = /query\/?$/, match;

        // Add the "query" part to the URL if not already present.
        match = url.match(queryRe);
        if (!match) {
            url = url.replace(/\/?$/, "/query");
        }

        Object.defineProperties(this, {
            /**
             * @member {string} - The URL to the feature layer.
             * @readonly
             */
            url: {
                value: url
            }
        });
    }


    /**
     * Begins a query for unique values.
     * @param {string} fieldName - The name of a field to get unique values for
     * @param {number} [resultOffset=0] - When a query exceeds the maximum number of records that can be requested from a service, use this value to send another request and start where you left off.
     * @param {Array.<string>} [previousValues=undefined] - When multiple queries are required to get all records, use this value to pass the previous queries' results.
     * @returns {Promise.<UniqueValuesQueryResponse>} Values returned from the query.
     */
    ProjectQueryManager.prototype.queryForUniqueValues = function (fieldName, resultOffset, previousValues) {
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
        var url = [this.url, qs].join("?");

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

                // Combine previous values with values from current query.
                values = previousValues ? previousValues.concat(values) : values;

                if (exceededTransferLimit) {
                    // If the query exceeded the amount of returned records for the service, submit a new query.
                    queryForUniqueValues(fieldName, resultOffset + values.length, values).then(function (resultPromise) {
                        if (resultPromise && resultPromise.complete) {
                            resolve(resultPromise);
                        }
                    }, function (err) {
                        reject(err);
                    });
                } else {
                    resolve({
                        fieldName: fieldName,
                        values: values,
                        complete: true
                    });
                }

            };
            request.send();
        });
    };

    /**
     * Queries a layer for all of the unique integer values contained in a field which contains
     * comma-delmited lists of integers.
     * @param {string} fieldName - The name of the field to query.
     * @returns {Promise.<UniqueValuesQueryResponse>} Values returned from the query.
     */
    ProjectQueryManager.prototype.queryForUniqueValuesFromCommaDelimted = function (fieldName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.queryForUniqueValues(fieldName).then(function (response) {
                // Get destinct array of integers. Convert to two-digit strings.
                response.values = conversionUtils.listStringsToNumberArray(response.values).map(function (n) {
                    var s = n.toString();
                    if (s.length < 2) {
                        s = '0' + s;
                    }
                    return s;
                });
                resolve(response);
            });
        });
    };

    /**
     * Starts the query for min and max date values.
     * @returns {Promise.<DateRangeResponse>} A promise returning the min and max date values for date fields.
     */
    ProjectQueryManager.prototype.queryForDates = function () {

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
        var url = [this.url, qs].join("?");

        return new Promise(function (resolve, reject) {
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
                        return conversionUtils.toRfc3339(v);
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

                resolve(ranges);
            };
            request.send();
        });

    };

    return ProjectQueryManager;
}));

