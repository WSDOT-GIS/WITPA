import { toRfc3339, tryParseDate } from "../common/conversionUtils";
import {
  MatchingElementForRangeInputNotFound,
  MissingAttributeError,
  TypeAttributeMismatchError
} from "./Errors";
import templates from "./templates";

/**
 * A module that creates a filter UI for projects.
 * @module ProjectFilter
 */

/**
 * Detail of the CustomEvent returned from the "submit-query" event.
 */
export interface SubmitQueryEventDetail {
  where: string | null;
}

/**
 * Defines the event type of the "submit-query" event.
 */
interface ProjectFilterFormElementEventMap extends HTMLElementEventMap {
  "submit-query": CustomEvent<SubmitQueryEventDetail>;
}

/**
 * Extension of HTMLFormElement interface that adds the "submit-query" event.
 */
export interface ProjectFilterFormElement extends HTMLFormElement {
  addEventListener<K extends keyof ProjectFilterFormElementEventMap>(
    type: K,
    listener: (
      this: HTMLFormElement,
      ev: ProjectFilterFormElementEventMap[K]
    ) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

/**
 * Gets the value from an HTML input element and returns its
 * as a string suitable for use in a SQL WHERE statement.
 * @param inputElement HTML input element
 * @returns values from date inputs will be returned as
 */
function getValueAsQueriableString(inputElement: HTMLInputElement) {
  const { type, value } = inputElement;
  if (!value) {
    return null;
  } else if (/^((date)|(time)|(datetime(-local)?))$/.test(type)) {
    // Date value must be enclosed in single-quotes and in RFC 3339 format.
    // The text of the attribute is already in RFC 3339, so there is no need to convert.
    return `'${value}'`;
  } else {
    return value;
  }
}

/**
 * Creates a where statement from input elements on a form that represent a begin and end range.
 * @param form The form containing the input element
 * @param bInput The input element where the user enters the begin value for a begin and end range.
 * (The end input element is determined by attributes and does not need to be passed to this function.)
 */
function getWhereStatementForRangeInput(
  form: HTMLFormElement,
  bInput: HTMLInputElement
) {
  const { rangeId } = bInput.dataset;
  if (!rangeId) {
    throw new MissingAttributeError(bInput, "data-range-id");
  }
  // Get the corresponding end field input
  const eInput = form.querySelector<HTMLInputElement>(
    `input[data-range-type='end'][data-range-id='${rangeId}'`
  );
  if (!eInput) {
    throw new MatchingElementForRangeInputNotFound(bInput);
  } else if (bInput.type !== eInput.type) {
    throw new TypeAttributeMismatchError(bInput, eInput);
  }

  // Get the begin and end values, then convert to how they would be written
  // in a SQL statement. Numbers and nulls are unchanged while dates are converted to
  // strings surrounded by single-quotes.
  const [b, e] = [bInput, eInput].map(getValueAsQueriableString);

  // Get the field names corresponding to the input elements.
  const [bName, eName] = [bInput, eInput].map(i => i.name);

  // Return the appropriate where statement depending on which fields have values.
  if (b !== null && e !== null) {
    if (bName === eName) {
      return `${bName} BETWEEN ${b} AND ${e}`;
    } else {
      return `(${bName} BETWEEN ${b} AND ${e}) AND (${eName} BETWEEN ${b} AND ${e})`;
    }
  } else if (b !== null) {
    return `${bName} >= ${b}`;
  } else if (e !== null) {
    return `${eName} <= ${e}`;
  }
}

function* getRangeWhereStatements(form: HTMLFormElement) {
  // Get input elements that hold the beginning value of a range.
  const beginInputs = form.querySelectorAll<HTMLInputElement>(
    "input[data-range-type='begin']"
  );

  for (const bInput of Array.from(beginInputs)) {
    const where = getWhereStatementForRangeInput(form, bInput);
    if (where) {
      yield where;
    }
  }
}

/**
 * @alias module:ProjectFilter
 * @class
 */
export default class ProjectFilter {
  private _form: ProjectFilterFormElement;
  /**
   * The HTML form
   * @member {external:HTMLFormElement}
   * @instance
   * @fires module:ProjectFilter#submit-query
   */
  public get form() {
    return this._form;
  }
  constructor() {
    const _form = document.createElement("form") as ProjectFilterFormElement;
    this._form = _form;
    _form.classList.add("basic-mode");
    const self = this;

    _form.innerHTML = templates.ProjectFilter;

    // Setup advanced mode toggle link.
    _form!
      .querySelector<HTMLAnchorElement>(".advanced-link")!
      .addEventListener("click", e => {
        _form.classList.toggle("basic-mode");
        _form.classList.toggle("advanced-mode");
        e.preventDefault();
      });

    // Gets the appropriate input elements based on if the form is in "basic" or "advanced" mode.
    function GetInputs() {
      const qs = _form.classList.contains("basic-mode")
        ? ".basic-filters [name]"
        : "[name]";
      return _form.querySelectorAll<HTMLInputElement>(qs);
    }

    // Create a where clause from the values the user has entered into the _form.
    _form.onsubmit = () => {
      // Get all of the input boxes that have values entered into them.
      const inputs = GetInputs();

      // Create a filtered array of the input elements,
      // removing the inputs that participate in a range.
      const nonRangeInputs = Array.from(inputs).filter(
        element => !element.dataset.hasOwnProperty("rangeType")
      );

      // Initialize the array that will hold field queries.
      const valuesParts = new Array<string>();

      // Loop through all of the input elements and create the queries, adding them to the array.
      for (const input of nonRangeInputs) {
        if (!input.value) {
          continue;
        }
        // Get the value of the data-where-template attribute, if available.
        let whereTemplate = input.dataset.whereTemplate || null;
        // If there is no data-where-template attribute, get the corresponding select element that will have the query template.
        if (!whereTemplate) {
          const whereTemplateElement = _form.querySelector<HTMLInputElement>(
            `[data-where-template-for='${input.name}']`
          );
          whereTemplate = whereTemplateElement
            ? whereTemplateElement.value
            : null;
        }
        // If the template was found, use the string template to create the where clause and
        // add it to the array.
        if (whereTemplate) {
          valuesParts.push(
            whereTemplate
              .replace(/\{field\}/g, input.name)
              .replace(/\{value\}/g, input.value)
          );
        }
      }

      // Handle the "IS NULL" queries
      // Get all of the selected null option elements that are selected.
      const nullOptions = _form.querySelectorAll<HTMLOptionElement>(
        "option:checked[value$='IS NULL']"
      );
      // If any are selected, convert them to queries and add to the values array.
      if (nullOptions) {
        Array.from(nullOptions, option => {
          const whereTemplate = option.value;
          const select = option.parentElement!;
          const fieldName = select.dataset.whereTemplateFor!;
          const query = whereTemplate.replace(/\{field\}/g, fieldName);
          valuesParts.push(query);
        });
      }

      // Add the where statements for the range inputs.
      for (const w of getRangeWhereStatements(_form)) {
        valuesParts.push(w);
      }

      const values = valuesParts.length > 0 ? valuesParts.join(" AND ") : null;

      let customEvent: CustomEvent<SubmitQueryEventDetail>;
      if (values) {
        customEvent = new CustomEvent("submit-query", {
          detail: {
            where: values
          }
        });

        /**
         * Submit query event
         * @event module:ProjectFilter#submit-query
         * @type {external:CustomEvent}
         * @property {Object} detail - Details about the submitted query
         * @property {string} detail.where - The where clause to use with a filter
         */
        _form.dispatchEvent(customEvent);
      }

      return false;
    };
  }
}
