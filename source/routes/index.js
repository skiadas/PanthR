
/*
 * GET home page.
 */

exports.index = function(req, res) {
   res.render('index', { title: 'Express' });
};
exports.register = function(req, res) {
   // Brings up registration screen (could be static?)
   res.render('register', { title: 'Register'});
};
exports.createUser = function (req, res) {
   console.log('createUser got Called');
   res.send('hello');
   return;
};
exports.forgotPwd = function (req, res) {
   res.render('forgotPwd', {title: "Forgot Password"});
}
exports.login = function(req, res) {
   // Brings up login screen (could be static?)
   res.render('login', {email: req.cookies.email});
};
exports.authenticate = function(req, res) {
   // Need to add login authentication code here probably
   res.send('authentication. should not be a regular page');
};
exports.check_available = function(req, res) {
    // TODO: Actually check if this email and username are valid.
    res.send({email: true, nick: true});
}