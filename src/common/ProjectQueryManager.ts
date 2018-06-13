/**
 * Manages queries to the projects layer.
 * @module ProjectQueryManager
 */

import { IFeature } from "@esri/arcgis-rest-common-types";
import {
  listStringsToNumberArray,
  objectToQueryString,
  toRfc3339
} from "./conversionUtils";

/**
 * Represents a range of dates.
 */
export interface DateRange {
  /** minimum date */
  min: Date;
  /** maximum date */
  max: Date;
}

/**
 * @typedef {Object.<string, DateRange>} DateRangeResponse
 * @property {DateRange} Advertisement_Date - Advertisement_Date
 * @property {DateRange} Operationally_Complete - Operationally_Complete
 * @property {DateRange} Begin_Preliminary_Engineering - Begin_Preliminary_Engineering
 */
export interface DateRangeResponse {
  Advertisement_Date: DateRange;
  Operationally_Complete: DateRange;
  Begin_Preliminary_Engineering: DateRange;
}

/**
 * @typedef {Object} UniqueValuesQueryResponse
 * @property {string} fieldName - The field name that the unique values correspond to.
 * @property {(string[]|number[])} values - An array of either string or number values.
 * @property {Boolean} complete - Indicates that the values list is complete.
 * Used by recursive calls for when the number of features that is allowed to be returned
 * is less than the total number of unique features.
 */
export interface UniqueValuesQueryResponse {
  fieldName: string;
  values: string[] | number[];
  complete: boolean;
}

export class ProjectQueryManager {
  /**
   * @member {string} - The URL to the feature layer.
   * @readonly
   */
  public readonly url: string;
  /**
   * @alias module:ProjectQueryManager
   * @class
   * @param {string} url - URL to a map service or feature service layer.
   */
  constructor(url: string) {
    const queryRe = /query\/?$/;

    // Add the "query" part to the URL if not already present.
    const match = url.match(queryRe);
    if (!match) {
      url = url.replace(/\/?$/, "/query");
    }
    this.url = url;
  }

  /**
   * Begins a query for unique values.
   * @param {string} fieldName - The name of a field to get unique values for
   * @param {number} [resultOffset=0] - When a query exceeds the maximum number of records that can be requested from a service, use this value to send another request and start where you left off.
   * @param {Array.<string>} [previousValues=undefined] - When multiple queries are required to get all records, use this value to pass the previous queries' results.
   * @returns {Promise.<UniqueValuesQueryResponse>} Values returned from the query.
   */
  public async queryForUniqueValues(
    fieldName: string,
    resultOffset: number = 0,
    previousValues?: string[]
  ): Promise<UniqueValuesQueryResponse> {
    const self = this;
    const query: any = {
      where: `${fieldName} IS NOT NULL`,
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
    const qs = objectToQueryString(query);
    const url = [this.url, qs].join("?");

    const response = await fetch(url);
    const responseObj = await response.json();
    const exceededTransferLimit = responseObj.exceededTransferLimit || false;
    // Get just the values.
    let values: string[] = responseObj.features.map(
      (feature: IFeature) => feature.attributes[fieldName]
    );

    // Combine previous values with values from current query.
    values = previousValues ? previousValues.concat(values) : values;

    if (exceededTransferLimit) {
      const uniqueValuesResponse = await self.queryForUniqueValues(
        fieldName,
        resultOffset + values.length,
        values
      );
      if (uniqueValuesResponse && uniqueValuesResponse.complete) {
        return uniqueValuesResponse;
      }
    }
    return {
      fieldName,
      values,
      complete: true
    } as UniqueValuesQueryResponse;
  }

  /**
   * Queries a layer for all of the unique integer values contained in a field which contains
   * comma-delmited lists of integers.
   * @param {string} fieldName - The name of the field to query.
   * @returns {Promise.<UniqueValuesQueryResponse>} Values returned from the query.
   */
  public async queryForUniqueValuesFromCommaDelimted(
    fieldName: string
  ): Promise<UniqueValuesQueryResponse> {
    const self = this;
    const response = await self.queryForUniqueValues(fieldName);
    // Get destinct array of integers. Convert to two-digit strings.
    response.values = listStringsToNumberArray(
      response.values as string[]
    ) as number[];
    return response;
  }

  /**
   * Starts the query for min and max date values.
   * @returns {Promise.<DateRangeResponse>} A promise returning the min and max date values for date fields.
   */
  public async queryForDates(): Promise<DateRangeResponse> {
    const outStatistics = [
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
    const query = {
      where: "Advertisement_Date IS NOT NULL",
      f: "json",
      // Create array of objects, then convert them to StatisticsDefinition objects.
      outStatistics
    };

    const qs = objectToQueryString(query);
    const url = `${this.url}?${qs}`;

    const response = await fetch(url);
    const queryResponse = await response.text();
    // Convert date values to
    const queryResponseObj = JSON.parse(queryResponse, (k, v) => {
      const dateFieldNameRe = /Date$/i;
      if (dateFieldNameRe.test(k) && typeof v === "number") {
        return toRfc3339(v);
      } else {
        return v;
      }
    });

    if (queryResponseObj.error) {
      // reject(queryResponseObj);
      // return;
      throw new Error(queryResponse);
    }

    const values = (queryResponseObj.features[0] as IFeature).attributes;

    // Create a list of field ranges.
    const ranges: DateRangeResponse = {
      Advertisement_Date: {
        min: values.Min_Ad_Date,
        max: values.Max_Ad_Date
      },
      Operationally_Complete: {
        min: values.Min_OC_Date,
        max: values.Max_OC_Date
      },
      Begin_Preliminary_Engineering: {
        min: values.Min_PE_Start_Date,
        max: values.Max_PE_Start_Date
      }
    };
    return ranges;
  }
}

export default ProjectQueryManager;
