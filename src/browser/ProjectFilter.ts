import templates from "./templates";

/**
 * A module that creates a filter UI for projects.
 * @module ProjectFilter
 */

/**
 * @alias module:ProjectFilter
 * @class
 */
export default class ProjectFilter {
  private _form: HTMLFormElement;
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
    const _form = document.createElement("form");
    this._form = _form;
    _form.classList.add("basic-mode");
    const self = this;

    _form.innerHTML = templates.ProjectFilter;

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
    _form.onsubmit = function() {
      // Get all of the input boxes that have values entered into them.
      const inputs = GetInputs();

      // Initialize the array that will hold field queries.
      const valuesParts = new Array<string>();

      // Loop through all of the input elements and create the queries, adding them to the array.
      Array.from(inputs, function(input) {
        return input;
      }).forEach(function(input) {
        let whereTemplate;
        if (input.value) {
          // Get the value of the data-where-template attribute, if available.
          whereTemplate = input.dataset.whereTemplate;
          // If there is no data-where-template attribute, get the corresponding select element that will have the query template.
          if (!whereTemplate) {
            whereTemplate = _form.querySelector(
              "[data-where-template-for='" + input.name + "']"
            );
            whereTemplate = whereTemplate ? whereTemplate.value : null;
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
      });

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

      const values = valuesParts.length > 0 ? valuesParts.join(" AND ") : null;

      let customEvent;
      if (valuesParts) {
        customEvent = new CustomEvent("submit-query", {
          detail: {
            where: valuesParts
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
