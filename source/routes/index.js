
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};
exports.register = function(req, res) {
    // Brings up registration screen (could be static?)
    return;
};
exports.login = function(req, res) {
    // Brings up login screen (could be static?)
    return;
};
exports.authenticate = function(req, res) {
    // Need to add login authentication code here probably
    return;
};