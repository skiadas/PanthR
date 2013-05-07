/*
 * GET home page.
 */
User = require('../libs/user');

exports.index = function(req, res) {
    res.render('index', {
        title: 'Express'
    });
};
exports.register = function(req, res) {
    // Brings up registration screen (could be static?)
    res.render('register', {
        title: 'Register'
    });
};
exports.createUser = function(req, res) {
    var user = new User({
        email: req.body.email,
        nick: req.body.nick,
        password: req.body.password
    });
    if (!User.checkExisting(user, function(err, result) {})) {
        user.encriptPassword().save(function(err, result) {});
    }
    res.render('index', {
        title: 'Express'
    });
    return;
};
exports.forgotPwd = function(req, res) {
    res.render('forgotPwd', {
        title: "Forgot Password"
    });
}
exports.login = function(req, res) {
    // Brings up login screen (could be static?)
    res.render('login', {
        title: 'login'
    });
};
exports.authenticate = function(req, res) {
    // Need to add login authentication code here probably
    var user = new User({
        email: req.body.email,
        nick: req.body.nick,
        password: req.body.password
    });
    if (user.validPassword(req.body.password)) {
        res.render('index', {
            title: 'Express'
        });
    } else {
        res.render('login', {
            title: 'Login'
        });
    }
};

exports.check_available = function(req, res) {
    // TODO: Actually check if this email and username are valid.
    res.send({
        email: true,
        nick: true
    });
}