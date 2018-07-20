import { CannotParseDateError } from "./Errors";

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
 * @throws {TypeError} - Thrown if the input parameter is not a valid Date, integer, or string.
 * @throws {CannotParseDateError} - Thrown if input is string but cannot be parsed into a valid Date.
 * @example
 * const d = new Date(2016, 4, 26);
 * const s = toRfc3339(d);
 * // Jasmine test
 * expect(s).toBe("2016-05-26");
 */
export function toRfc3339(date: Date | number | string): string {
  let outDate: Date | null = null;
  if (date instanceof Date) {
    outDate = date;
  } else if (typeof date === "number" || typeof date === "string") {
    outDate = new Date(date);
  } else if (typeof date === "string") {
    const parsedValue = Date.parse(date);
    if (isNaN(parsedValue)) {
      throw new CannotParseDateError(date);
    }
  }

  if (!outDate) {
    throw new TypeError(
      "The input parameter must be either a date, an integer, or a string."
    );
  }
  // Convert the date to ISO string, then remove the time portion (everything after and including the "T").
  return outDate.toISOString().replace(/T.+$/i, "");
}

/**
 * Tries to parse a string into a date.
 * If the string cannot be parsed into a valid date, null is returned.
 * Otherwise the resulting Date object is returned.
 *
 * This differs from the Date constructor in that the Date constructor
 * will return a Date representing an "Invalid Date" if an unparseable
 * string is used, whereas this function returns a null in this case.
 * @param input - a string that may or may not be parseable into a valid Date.
 * @returns Returns a Date object (which is truthy) if the input string
 * is parseable, and null (which is falsy) otherwise.
 */
export function tryParseDate(input: string) {
  const parsedValue = Date.parse(input);
  if (isNaN(parsedValue)) {
    return null;
  } else {
    return new Date(input);
  }
}
