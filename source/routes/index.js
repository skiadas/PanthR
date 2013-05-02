
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};
exports.register = function(req, res) {
    // Brings up registration screen (could be static?)
    res.send('registration page');
};
exports.login = function(req, res) {
    // Brings up login screen (could be static?)
    res.send('login page');
};
exports.authenticate = function(req, res) {
    // Need to add login authentication code here probably
    res.send('authentication. should not be a regular page');
};