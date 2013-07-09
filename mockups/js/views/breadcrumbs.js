define(
    ['handlebars', 'backbone', 'epoxy'],
    function(Handlebars, Backbone) {
        return Backbone.Epoxy.View.extend({
            render: function(structure) {
                $(this.el).html(Handlebars.compile(this.template)(structure));
            }
        });
    }
);