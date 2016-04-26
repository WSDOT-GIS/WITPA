"use strict";

var conversionUtils = require("../conversionUtils.js");

describe("conversionUtils", function () {
	it("should be able to convert list strings to a number array.", function () {
		var input = [" ", "01, 02", "01, 02, 09", "01, 04, 08", "01, 06, 07, 09", "01, 07", "01, 08", "01, 09", "02, 06", "02, 07", "03, 04", "03, 06", "03, 06, 10", "03, 08, 10", "03, 10", "04, 05", "04, 08", "06, 09", "06, 09, 10", "06, 10", "07, 08", "07, 09", "08, 09", "08, 09, 10", "08, 10", "09, 10", "1", "10", "2", "3", "4", "5", "6", "7", "8", "9"];
		var output = conversionUtils.listStringsToNumberArray(input);
		var expectedOutput = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(output.length).toBe(expectedOutput.length);

		for (let i = 0; i < output.length; i++) {
			expect(output[i]).toBe(expectedOutput[i]);
		}
	});

	it("should be able to convert object to query string", function () {
		var params = {
			f: "json",
			returnGeometry: false
		};
		var qs = conversionUtils.objectToQueryString(params);

		expect(qs).toBe("f=json&returnGeometry=false");
	});

	it("should convert date to RFC 3339 format string", function () {
		var d = new Date(2016, 4, 26);
		var s = conversionUtils.toRfc3339(d);
		expect(s).toBe("2016-05-26");
		s = conversionUtils.toRfc3339(d.getTime());
		expect(s).toBe("2016-05-26");
		expect(function () {
			d = "Hello";
			s = conversionUtils.toRfc3339(d);
		}).toThrowError(TypeError);
	});
});