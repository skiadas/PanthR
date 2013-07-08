define(['when'], function(when) {
    return function(options) {
        // options provided when the plugin is declared in the wire-spec
        // We might allow registering handlers here perhaps.
        return {
            // Instance specific methods go here
            resolvers: {
                json: function(resolver, refName, refObj, wire) {
                    wire.loadModule('text!' + refName)
                    .then(function(template) {
                        var parse = JSON.parse(template);
                        resolver.resolve(parse)
                    }).otherwise(function(error) {
                        resolver.reject(error);
                    });
                }
            }
        }
    }
});
