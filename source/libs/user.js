var db = require('./db');

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

User.prototype = {
   print: function () {
      return this.fname + ' ' + this.lname
   },
   validPassword: function (password) {
      var salt = this.salt;
      var hashpassword = crypto.createHash('sha512')
         .update(salt + password)
         .digest('hex');
      return (user.password === hashpassword);
   },
   save: function (callback) {
      db.createUser(this, callback);
      return this;
   }//,
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



