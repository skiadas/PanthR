define(['backbone', 'epoxy'], function(Backbone) {
    var AppController = Backbone.Epoxy.View.extend({
        initialize: function() {
            console.log("App Initializing: ", this);
        },
        getWorkspace: function() {
            // "structures" is injected
            // Just a mockup for now
            console.log("getting workspace")
            return this.structures.structures[0];
        },
        activeStructure: function(id) {
            return this.structures.getById(id);
        }
    });
    return AppController;
});