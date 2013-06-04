var util = require('util'),
    events = require('events'),
    db = require('./db.js'),
    routing = require('./pubsub.js'),
    crypto = require('crypto'),
    _ = require('underscore');


var User = function(obj) { _.extend(this, obj); };

User.pubsubHandler = routing.register(User, {
    subscribe: 'user/:action',
    success: 'user/past:action',
    error: 'error/user/pastneg:action'
});




// User.passwordHash(email)    ->   Returns hash pair for the user with that email. Cache it
// User.passwordHash(email, pass)  -> true/false whether valid password for that email
// _passwordHash(pass)  ->  Produces a hash pair from pass
// User.passwordReset(email)   ->  Create request for password resetting
// User.passwordReset(email, reqStr, newPass)   -> Verify request is valid, and change password

User.find = function(email) {
   PubSub.subscribe("user/find", function(email) {
      //it should publish if db.findUser() gets called
      PubSub.publish('db/find/user', [email], this);
   });
   PubSub.subscribe("db/user/found", function(email) {
   //it should publish if a new structure is created
      PubSub.publish('user/found', [email], this);
   });
   return this;
};


User.delete = function(email) {
   //return db.deleteUser(email, callback);
   // PubSub for delete()
   PubSub.subscribe("user/delete", function(email) {
      //it should publish if db.createStructure() gets called
      PubSub.publish('db/delete/user', [email], this);
   });
   PubSub.subscribe("db/user/deleted", function(email) {
   //it should publish if a new structure is created
      PubSub.publish('user/deleted', [email], this);
   });
   return this;
}



User.checkExisting = function(user) {
   // PubSub for checkExisting()
   PubSub.subscribe("user/checkExisting", function(user) {
      //it should publish if db.createStructure() gets called
      PubSub.publish('db/find/user', [user.email, {nick: 1,email: 1,password: 1}], this);
   });
   PubSub.subscribe("db/user/found", function(user) {
   //it should publish if a new structure is created
      PubSub.publish('user/checkedExistence', [user], this);
   });
}

events.EventEmitter.call(User);
util.inherits(User, events.EventEmitter);

User.prototype = {
   print: function() {
      return this.fname + ' ' + this.lname
   },
   validPassword: function(password) {
      var salt = this.password.salt;
      var hashpassword = crypto.createHash('sha512').update(salt + password).digest('hex');
      return (this.password.hash === hashpassword);
   },
   save: function() {
      //db.createUser(this, callback);
      PubSub.publish('db/create/user', [this], this);
      return this;
   },
   encriptPassword: function() {
      var salt = Math.round((new Date().valueOf() * Math.random())) + '';
      var hashpassword = crypto.createHash('sha512').update(salt + this.password).digest('hex');
      this.password = {
         salt: salt,
         hash: hashpassword
      };
      return this;
   },
   addFriend: function(friend, circleArray) {
      //db.addFriend(User, friend, circleArray, callback);
      PubSub.publish('user/add/friend', [friend, circleArray], this);
      return this;
   },
   tagFriend: function(friend, circleArray) {
      //db.tagFriend(User, friend, circleArray, callback);
      PubSub.publish('user/tag/friend', [friend, circleArray], this);
      return this;
   },
   unTagFriend: function(friend, circleArray) {
      //db.unTagFriend(User, friend, circleArray, callback);
      PubSub.publish('user/untag/friend', [friend, circleArray], this);
      return this;
   },
   removeFriend: function(friend, circleArray) {
      //db.removeFriend(User, friend, circleArray, callback);
      PubSub.publish('user/remove/friend', [friend, circleArray], this);
      return this;
   }
   //},
   //accessWorkspaces: function (, callback) {
   //
   //},
   //defaultWorkspace: function (, callback) {
   //
   //},
};

/*var a = new User({
   email: 'a@a.com',
   nick: 'john',
   password: 'pass'
});
/*setTimeout(function(){
    a.encriptPassword().save();
    console.log("Created dummy user");
}, 2000);*/

module.exports = User;