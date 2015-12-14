/**
 * HTML Form Element
 * @external HTMLFormElement
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement}
 */

/*
 * CustomEvent
 * @external CustomEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent}
 */

/**
 * A module that creates a filter UI for projects.
 * @module ProjectFilter
 */
define(["dojo/text!./Templates/ProjectFilter.html"], function (template) {
    "use strict";

    /**
     * @constructor
     * @alias module:ProjectFilter
     */
    function ProjectFilter() {
        var _form = document.createElement("form");
        var self = this;

        _form.innerHTML = template;

        // Create a where clause from the values the user has entered into the _form.
        _form.onsubmit = function () {
            var inputs = _form.querySelectorAll("[name]");

            var values = [];

            Array.from(inputs, function (input) {
                return input;
            }).forEach(function (input) {
                var whereTemplate;
                if (input.value) {
                    whereTemplate = input.dataset.whereTemplate;
                    if (!whereTemplate) {
                        whereTemplate = _form.querySelector("[data-where-template-for='" + input.name + "']");
                        whereTemplate = whereTemplate ? whereTemplate.value : null;
                    }
                    if (whereTemplate) {
                        values.push(whereTemplate.replace("{field}", input.name).replace("{value}", input.value));
                    }
                }
            });
            
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
             * 
             * @type {external:HTMLFormElement}
             * @instance
             * @memberOf module:ProjectFilter
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
 * 
 * @event module:ProjectFilter#submit-query
 * @type {CustomEvent}
 * @property {Object} detail - Details about the submitted query
 * @property {string} detail.where - The where clause to use with a filter
 */

    return ProjectFilter;
});