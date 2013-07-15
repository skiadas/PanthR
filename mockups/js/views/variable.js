define(['handlebars', 'backbone', 'epoxy'], function(Handlebars, Backbone) {
    return Backbone.Epoxy.View.extend({
        renderView: function(structure) {
            console.log("VariableView!")
            return Handlebars.compile(this.templates.view)(structure);
        },
        renderEdit: function(structure) {
            console.log("VariableEdit!")
            return Handlebars.compile(this.templates.edit)(structure);
        }
    });
});