define(['backbone', 'epoxy'], function(Backbone) {
    return Backbone.Epoxy.Model.extend({
        constructor: function(models) {
            this.structures = models;
            console.log("models: ", models);
            Backbone.Epoxy.Model.apply(this, arguments);
        }
    });
});