define(['backbone', 'epoxy'], function(Backbone) {
    var AppController = Backbone.Epoxy.View.extend({
        initialize: function() {
            console.log("App Initializing: ", this);
        }
    });
    return AppController;
});