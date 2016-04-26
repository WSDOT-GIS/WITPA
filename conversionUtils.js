// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.conversionUtils = factory();
    }
}(this, function () {
    "use strict";

    /**
     * Utility module that provides conversion functions.
     * @module conversionUtils
     */

    var exports = {};

    /**
     * Converts the arrays of comma-separated number strings array of numbers.
     * @param {string[]} response - The response from a map service layer query.
     * @return {number[]} - An array of distinct numbers parsed from the input string.
     * @example
     * var input = [" ","01, 02","01, 02, 09","01, 04, 08","01, 06, 07, 09","01, 07","01, 08","01, 09","02, 06","02, 07","03, 04","03, 06","03, 06, 10","03, 08, 10","03, 10","04, 05","04, 08","06, 09","06, 09, 10","06, 10","07, 08","07, 09","08, 09","08, 09, 10","08, 10","09, 10","1","10","2","3","4","5","6","7","8","9"];
     * var output = listStringsToNumberArray(input);
     * // Output equals [1,2,3,4,5,6,7,8,9,10]
     */
    exports.listStringsToNumberArray = function (values) {
        var s = new Set();
        values.forEach(function (str) {
            str.split(/\s*,\s*/g).forEach(function (item) {
                if (/\d+/.test(item)) {
                    s.add(Number(item));
                }
            });
        });

        var compareNumbers = function (a, b) {
            return a === b ? 0 : a > b ? 1 : -1;
        };

        return Array.from(s).sort(compareNumbers);
    };

    /**
     * Converts an object into a query string.
     * @param {Object.<string,*>} o - An object with query string parameters.
     * @returns {string} Returns a query string representation of the input object.
     * @throws {external:TypeError} - Throws a type error if the input is not an object.
     */
    exports.objectToQueryString = function (o) {
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
    };

    /**
     * Converts an integer into a string representation of a date suitable for date input element attributes.
     * @param {(Date|number)} date - An integer representation of a date.
     * @returns {string} string representation of the input date value ({@link https://tools.ietf.org/html/rfc3339|RFC 3339 format}).
     * @throws {external:TypeError} - Thrown if the input parameter is not a valid Date or integer.
     * @example
     * var d = new Date(2016, 4, 26);
     * var s = conversionUtils.toRfc3339(d);
     * // Jasmine test
     * expect(s).toBe("2016-05-26");
     */
    exports.toRfc3339 = function(date) {
        var date = typeof date === "number" ? new Date(date) : date instanceof Date ? date : null;
        if (date === null) {
            throw new TypeError("The input parameter must be either a date or an integer.");
        }
        date = date.toISOString().replace(/T.+$/i, "");
        return date;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return exports;
}));

