exports.mapRoute = function(app, prefix) {
    prefix = '/' + prefix;
    var prefixObj = require('./routes' + prefix);
    // Ensure prefixObj has the required properties, else put stubs.
    ['index', 'new', 'show', 'create', 'edit', 'update', 'destroy'].forEach(function(suffix) {
       prefixObj[suffix] = prefixObj[suffix] || function(req, res) {
          throw new Error(req.url + ' not implemented'); 
       };
    });
    // index
    app.get(prefix, prefixObj.index);
    // add
    app.get(prefix + '/new', prefixObj.new);
    // show
    app.get(prefix + '/:id', prefixObj.show);
    // create
    app.post(prefix + '/create', prefixObj.create);
    // edit
    app.get(prefix + '/:id/edit', prefixObj.edit);
    // update
    app.put(prefix + '/:id', prefixObj.update);
    // destroy
    app.del(prefix + '/:id', prefixObj.destroy);
};