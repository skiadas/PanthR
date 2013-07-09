define(['backbone'], function(Backbone) {
    // Until we find another routing system, we need to mask the 
    // actual methods behind some fake calls.
    // Reason being that Backbone.history hooks into those routes in a 
    // private manner before wire.js has a chance to connect
    // Use the non-underscored version with the "connect" facet.
    return Backbone.Router.extend({
        routes: {
            "about" : "_showAbout",
            "structure/:id" : "_getStructure",
            "structure/:id/edit" : "_editStructure",
            "*other": "_defaultRoute"
        },
        showAbout: function() {
            
        },
        _getStructure: function(id) {
            this.getStructure(id);
        },
        getStructure: function(id) {
            // Used as a "connect" hook
        },
        editStructure: function(id) {
            console.log("Calling edit")
        },
        defaultRoute: function() {
            console.log("Router default route.");
        },
        initialize: function() {
            console.log("Router initializing.")
        },
        startListening: function() {
            console.log("Router starting to listen.")
            Backbone.history.start();
        }
    });
});