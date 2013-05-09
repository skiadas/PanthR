/*
 * GET home page.
 */
User = require('../libs/user');
db = require('../libs/db');
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
      user.encriptPassword().save(function(err, result) {
         res.redirect('/');
      });
   } else {
      res.redirect('register');
   }
};
exports.forgotPwd = function(req, res) {
   res.render('forgotPwd', {
      title: "Forgot Password"
   });
}
exports.login = function(req, res) {
   // Brings up login screen (could be static?)
   res.render('login', {
      title: 'login',
      message: req.flash('error') || ""
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
exports.checkAvailable = function(req, res) {
   // We need to construct the query ourselves instead of simply accepting the request's query,
   // for security (to avoid someone making $where requests for instance)
   var check;
   var query = {};
   if (req.query.email) {
      check = 'email';
   } else if (req.query.nick) {
      check = 'nick';
   } else {
      res.send(404);
      return;
   }
   query[check] = req.query[check];
   db.doRequest('users', 'findOne', [query], function(err, user) {
      res.json({
         avail: !user
      });
   });
}
exports.requestReset = function(req, res) {
   // Called when user enters his email to have his password reset
   //create a request
   db.resetRequest(req.body.email, function(err, request) {
      if (!request) {
         res.send('No email found');
      } else {
         var newRequestHash = request;
         emailReset(req.body.email, newRequestHash, function(err, request) {
            if (request) {
               res.send('EMail sent');
            }
         });
      }
   });
}
exports.reset = function(req, res) {
   // If called as '/reset', serves the reset page
   if (req.params. / reset) {
      res.render('reset', {
         title: 'Reset'
      });
   } else {
      // If called as '/reset/longRequestHash, verifies request and serves a new password form
      db.verifyRequest(req.params.requestHash, function(err, request) {
         if (!request) {
            res.send(404);
         } else {
            res.render('somepage', {
               email: email,
               requestHash: requestHash
            });
         }
      });
   }
}
exports.performReset = function(req, res) {
   // Called when user enters the new password
   db.changePassword() //still needs work
}