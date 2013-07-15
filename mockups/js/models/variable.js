define(['backbone', 'epoxy'], function(Backbone) {
    Variable = Backbone.Epoxy.Model.extend({
        vars: function() {
            return this.get('links');
        }
    });
    return Variable;
});