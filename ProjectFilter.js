define(["dojo/text!./Templates/ProjectFilter.html"], function (template) {
    "use strict";

    function ProjectFilter() {
        var _form = document.createElement("form");

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

        _form.addEventListener("reset", function () {
            var customEvent = new CustomEvent('reset');
            _form.dispatchEvent(customEvent);
        });

        Object.defineProperties(this, {
            form: {
                get: function () {
                    return _form;
                }
            }
        });
    }

    return ProjectFilter;
});