define(['backbone', 'epoxy'], function(Backbone) {
    var AppController = Backbone.Epoxy.View.extend({
        initialize: function() {
            console.log("App Initializing: ", this);
        },
        getWorkspace: function() {
            // "structures" is injected
            // Just a mockup for now
            console.log("getting workspace", this.structures)
            return this.structures[0];
        }
    });
    return AppController;
});