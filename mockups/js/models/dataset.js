define(['backbone', 'epoxy'], function(Backbone) {
    Dataset = Backbone.Epoxy.Model.extend({
        vars: function() {
            return this.get('links');
        }
    });
    return Dataset;
});