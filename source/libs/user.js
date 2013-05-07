var db = require('./db');
var crypto = require('crypto');

var User = function (obj) {
   for (i in obj) {
      if (obj.hasOwnProperty(i)) {
         this[i] = obj[i];
      }
   }
}

User.find = function (email, callback) {
   return db.findUser(email, callback);
}

User.delete = function (email, callback) {
   return db.deleteUser(email, callback);
}

User.checkExisting = function (user, callback) {
   return db.findUser(user.email, {
      nick: 1,
      email: 1,
      password: 1
   }, callback);
}

User.prototype = {
   print: function () {
      return this.fname + ' ' + this.lname
   },
   validPassword: function (password) {
      var salt = this.password.salt;
      var hashpassword = crypto.createHash('sha512')
         .update(salt + password)
         .digest('hex');
      return (user.password.hash === hashpassword);
   },
   save: function (callback) {
      db.createUser(this, callback);
      return this;
   },
   encriptPassword: function () {
      var salt = Math.round((new Date().valueOf() * Math.random())) + '';
      var hashpassword = crypto.createHash('sha512')
         .update(salt + this.password)
         .digest('hex');
      this.password = {
         salt: salt,
         hash: hashpassword
      };
      return this;
   } //,
   //friends: function (, callback) {
   //
   //},
   //accessWorkspaces: function (, callback) {
   //
   //},
   //defaultWorkspace: function (, callback) {
   //
   //},

};

var a = new User({
   email: 'a1@a.com',
   fname: 'john',
   lname: 'doe'
});

console.log(a instanceof User);
console.log(a.print());
module.exports = User;