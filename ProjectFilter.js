define(["dojo/text!./Templates/ProjectFilter.html"], function (template) {
    "use strict";
    /**
     * A module that creates a filter UI for projects.
     * @module ProjectFilter
     */

    /**
     * @constructor
     * @alias module:ProjectFilter
     */
    function ProjectFilter() {
        var _form = document.createElement("form");
        _form.classList.add("basic-mode");
        var self = this;

        _form.innerHTML = template;

        _form.querySelector(".advanced-link").addEventListener("click", function (e) {
            _form.classList.toggle("basic-mode");
            _form.classList.toggle("advanced-mode");
            e.preventDefault();
        });

        // Gets the appropriate input elements based on if the form is in "basic" or "advanced" mode.
        function GetInputs() {
            var qs = _form.classList.contains("basic-mode") ? ".basic-filters [name]" : "[name]";
            return _form.querySelectorAll(qs);
        }

        // Create a where clause from the values the user has entered into the _form.
        _form.onsubmit = function () {
            // Get all of the input boxes that have values entered into them.
            var inputs = GetInputs();

            // Initialize the array that will hold field queries.
            var values = [];

            // Loop through all of the input elements and create the queries, adding them to the array.
            Array.from(inputs, function (input) { return input; }).forEach(function (input) {
                var whereTemplate;
                if (input.value) {
                    // Get the value of the data-where-template attribute, if available.
                    whereTemplate = input.dataset.whereTemplate;
                    // If there is no data-where-template attribute, get the corresponding select element that will have the query template.
                    if (!whereTemplate) {
                        whereTemplate = _form.querySelector("[data-where-template-for='" + input.name + "']");
                        whereTemplate = whereTemplate ? whereTemplate.value : null;
                    }
                    // If the template was found, use the string template to create the where clause and
                    // add it to the array.
                    if (whereTemplate) {
                        values.push(whereTemplate.replace(/\{field\}/g, input.name).replace(/\{value\}/g, input.value));
                    }
                }
            });

            // Handle the "IS NULL" queries
            // Get all of the selected null option elements that are selected.
            var nullOptions = _form.querySelectorAll("option:checked[value$='IS NULL']");
            // If any are selected, convert them to queries and add to the values array.
            if (nullOptions) {
                Array.from(nullOptions, function (/**{HTMLOptionElement}*/ option) {
                    var whereTemplate = option.value;
                    var select = option.parentElement;
                    var fieldName = select.dataset.whereTemplateFor;
                    var query = whereTemplate.replace(/\{field\}/g, fieldName);
                    values.push(query);
                });
            }

            values = values.length > 0 ? values.join(" AND ") : null;

            var customEvent;
            if (values) {

                customEvent = new CustomEvent('submit-query', {
                    detail: {
                        where: values
                    }
                });

                _form.dispatchEvent(customEvent);
            }

            return false;


        };

        Object.defineProperties(this, {
            /**
             * The HTML form
             * @member {external:HTMLFormElement}
             * @instance
             * @fires {module:ProjectFilter#submit-query}
             */
            form: {
                get: function () {
                    return _form;
                }
            }
        });
    }

/**
 * Submit query event
 * @event module:ProjectFilter#submit-query
 * @type {CustomEvent}
 * @property {Object} detail - Details about the submitted query
 * @property {string} detail.where - The where clause to use with a filter
 */

    return ProjectFilter;
});