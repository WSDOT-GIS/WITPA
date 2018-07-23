import {
  listStringsToNumberArray,
  objectToQueryString,
  toRfc3339
} from "../common/conversionUtils";
import { ProjectQueryManager } from "../common/ProjectQueryManager";

const myWorker = self as DedicatedWorkerGlobalScope;

myWorker.addEventListener("error", err => {
  myWorker.postMessage({ error: err });
});

function postUniqueValuesMessage(response: any) {
  myWorker.postMessage(response);
}

myWorker.addEventListener("message", e => {
  const queryRe = /query\/?$/;
  const uniqueValueFieldNames = [
    "RouteID",
    "Project_Title",
    "Sub_Category",
    "PIN",
    "Improvement_Type",
    "Work_Description",
    "Sub_Program",
    "Region",
    "Program"
  ];
  const numberListFieldNames = ["Congressional_District"];
  if (e.data.url) {
    // Start the queries, then close this worker when all queries are completed (whether successful or not).

    const queryManager = new ProjectQueryManager(e.data.url);
    myWorker.postMessage({ type: "queryTaskCreated", url: queryManager.url });
    const datePromise = queryManager.queryForDates();
    datePromise.then(dateRanges => {
      myWorker.postMessage({ ranges: dateRanges });
    });

    const numberListPromises = numberListFieldNames.map(fieldName => {
      return queryManager
        .queryForUniqueValuesFromCommaDelimted(fieldName)
        .then(values => {
          postUniqueValuesMessage(values);
        });
    });

    const fieldPromises = uniqueValueFieldNames.map(fieldName => {
      return queryManager.queryForUniqueValues(fieldName).then(values => {
        postUniqueValuesMessage(values);
      });
    });

    const promises = ([datePromise] as Array<Promise<any>>)
      .concat(numberListPromises)
      .concat(fieldPromises);

    Promise.all(promises).then(
      successResult => {
        myWorker.close();
      },
      errorResult => {
        myWorker.close();
      }
    );
  }
});
