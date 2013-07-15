define(['backbone', 'epoxy'], function(Backbone) {
    return Backbone.Epoxy.Model.extend({
        constructor: function(models) {
            this.structures = models;
            console.log("models: ", models);
            Backbone.Epoxy.Model.apply(this, arguments);
        },
        getById: function(id) {
            var structure = _.findWhere(this.structures, { id: parseInt(id) }),
                type = structure.type,
                Model = this.models[type];
            var data = new Model(structure);
            console.log(structure, type, Model, data);
            return data;
        }
    });
});