/**
 * Utility module that provides conversion functions.
 * @module conversionUtils
 */

/**
 * Converts the arrays of comma-separated number strings array of numbers.
 * @param {string[]} response - The response from a map service layer query.
 * @return {number[]} - An array of distinct numbers parsed from the input string.
 * @example
 * var input = [" ","01, 02","01, 02, 09","01, 04, 08","01, 06, 07, 09","01, 07","01, 08","01, 09","02, 06","02, 07","03, 04","03, 06","03, 06, 10","03, 08, 10","03, 10","04, 05","04, 08","06, 09","06, 09, 10","06, 10","07, 08","07, 09","08, 09","08, 09, 10","08, 10","09, 10","1","10","2","3","4","5","6","7","8","9"];
 * var output = listStringsToNumberArray(input);
 * // Output equals [1,2,3,4,5,6,7,8,9,10]
 */
export function listStringsToNumberArray(values: string[]) {
  const s = new Set<number>();
  values.forEach(str => {
    str.split(/\s*,\s*/g).forEach(item => {
      if (/\d+/.test(item)) {
        s.add(Number(item));
      }
    });
  });

  const compareNumbers = (a: number, b: number) => {
    return a === b ? 0 : a > b ? 1 : -1;
  };

  return Array.from(s).sort(compareNumbers);
}

/**
 * Converts an object into a query string.
 * @param {Object.<string,*>} o - An object with query string parameters.
 * @returns {string} Returns a query string representation of the input object.
 * @throws {external:TypeError} - Throws a type error if the input is not an object.
 */
export function objectToQueryString(o: { [key: string]: any }) {
  if (!(o && typeof o === "object")) {
    throw new TypeError("Input parameter should be an object.");
  }

  const output = [];

  for (const name in o) {
    if (o.hasOwnProperty(name)) {
      let value = o[name];
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
 * @param {(Date|number)} date - An integer representation of a date.
 * @returns {string} string representation of the input date value ({@link https://tools.ietf.org/html/rfc3339|RFC 3339 format}).
 * @throws {external:TypeError} - Thrown if the input parameter is not a valid Date or integer.
 * @example
 * var d = new Date(2016, 4, 26);
 * var s = conversionUtils.toRfc3339(d);
 * // Jasmine test
 * expect(s).toBe("2016-05-26");
 */
export function toRfc3339(date: Date | number): string {
  const outDate =
    typeof date === "number"
      ? new Date(date)
      : date instanceof Date
        ? date
        : null;
  if (outDate === null) {
    throw new TypeError(
      "The input parameter must be either a date or an integer."
    );
  }
  return outDate.toISOString().replace(/T.+$/i, "");
}
