define(['handlebars', 'backbone', 'epoxy'], function(Handlebars, Backbone) {
    return Backbone.Epoxy.View.extend({
        renderView: function(structure) {
            console.log("VariableView!", structure)
            return Handlebars.compile(this.templates.view)(structure.toJSON());
        },
        renderEdit: function(structure) {
            console.log("VariableEdit!", structure)
            return Handlebars.compile(this.templates.edit)(structure.toJSON());
        }
    });
});