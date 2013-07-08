define(['backbone', 'epoxy'], function(Backbone) {
    return Backbone.Epoxy.View.extend({
        renderSidebar: function(workspace) {
            console.log("yey!", this.el, workspace);
        }
    });
});