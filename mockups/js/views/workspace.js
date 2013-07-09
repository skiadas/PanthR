define([
    'handlebars', 'backbone', 'epoxy',
    'text!templates/partials/sidebarItem.hbs', 'text!templates/partials/sidebarMain.hbs'
], function(Handlebars, Backbone, _tmp, partialItem, partialMain) {
    return Backbone.Epoxy.View.extend({
        renderSidebar: function(workspace) {
            console.log("yey!", this.el, workspace);
            Handlebars.registerPartial('sidebarItem', partialItem);
            Handlebars.registerPartial('sidebarMain', partialMain);
            $(this.el).html(Handlebars.compile(this.template)(workspace));
            $('[data-toggle="popover"]').popover();
        },
        highlightActive: function(id) {
            $('li', this.el).removeClass('active');
            $('#sidebarItem' + id).addClass('active');
        }
    });
});