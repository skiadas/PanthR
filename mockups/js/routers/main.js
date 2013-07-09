define(['backbone'], function(Backbone) {
    return Backbone.Router.extend({
        routes: {
            "about" : "showAbout",
            "structure/:id" : "getStructure",
            "structure/:id/edit" : "editStructure",
            "*other": "defaultRoute"
        },
        showAbout: function() {
            
        },
        getStructure: function(id) {
            console.log("Structure: ", id);
        },
        editStructure: function(id) {
            
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