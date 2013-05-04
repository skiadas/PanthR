
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash')
  , path = require('path')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , User = require('./libs/user');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//
// PASSPORT AUTHORIZATION SETUP
//
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function(email, password, done) {
    User.find(email, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.email);
});
passport.deserializeUser(function(email, done) {
  User.find(email, function(err, user) {
    done(err, user);
  });
});

//
// ROUTES
//
app.get('/', routes.index);
app.get('/register', routes.register);
app.post('/register', routes.createUser);
app.get('/forgotPwd', routes.forgotPwd);
app.post('/forgotPwd', routes.login);
app.get('/login', routes.login);
app.post('/login', 
    passport.authenticate('local', { successRedirect: '/user',
                                     failureRedirect: '/login',
                                     failureFlash: true })
);
app.get('/user', 
    passport.authenticate('local', { successRedirect: '/user',
                                     failureRedirect: '/login',
                                     failureFlash: true })
);

// 
// SOCKET.IO SETUP
// 
io.sockets.on('connection', function (socket) {
    // TODO change this code
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
// 
// START SERVER
// 
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
