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
            
        },
        editStructure: function(id) {
            
        },
        defaultRoute: function() {
            console.log("Defaulting!!");
        },
        initialize: function() {
            console.log("Initializing!")
        },
        startListening: function() {
            console.log("Starting to listen.")
            Backbone.history.start();
        }
    });
});