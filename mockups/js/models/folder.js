define(['backbone', 'epoxy'], function(Backbone) {
    Folder = Backbone.Epoxy.Model.extend({
        // Placeholder method so that it has one
        vars: function() {
            return this.get('links');
        }
    });
    return Folder;
});