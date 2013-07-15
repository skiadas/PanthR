define(['handlebars', 'backbone', 'epoxy'], function(Handlebars, Backbone) {
    return Backbone.Epoxy.View.extend({
        renderView: function(structure) {
            console.log("DatasetView!")
            return Handlebars.compile(this.templates.view)(structure.toJSON({computed: true}));
        },
        renderEdit: function(structure) {
            console.log("DatasetEdit!")
            return Handlebars.compile(this.templates.edit)(structure.toJSON({computed: true}));
        }
    });
});