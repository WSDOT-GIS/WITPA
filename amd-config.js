
(function (root) {
    window.dojoConfig = {
        async: true,
        packages: [
            {
                name: "witpa",
                location: root
            },
            {
                name: "jquery",
                location: root + "/bower_components/jquery/dist",
                main: "jquery" // jquery.slim not compatible with jquery-ui autocomplete.
            },
            {
                name: "jquery-ui",
                location: root + "/bower_components/jquery-ui/ui",
                main: "core"
            }
        ]
    }
} (location.href.replace(/\/[^\/]*$/, "")));
