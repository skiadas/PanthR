define(['backbone', 'epoxy'], function(Backbone, _tmp) {
    return Backbone.Epoxy.View.extend({
        // injected: views
        render: function(structure) {
            var type = structure.get('type'),
                view = this.views[type];
            console.log(view);
            if (!view) {
                console.error("Unknown view for: ", type);
            }
            $(this.editel).html(view.renderEdit(structure));
            $(this.viewel).html(view.renderView(structure));
        },
    });
});