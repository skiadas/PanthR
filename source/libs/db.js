var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {
   auto_reconnect: true
});


// intitalize function
// input: takes a database object
// if known contects database object (ex. testing)
// if it doesnt find calls function to initialize standard

function init(callback) {
   if (this.db) { 
      callback (null, this.db)
   } else {
      this.db = 'opening';
      var newdb = new mongodb.Db('panthrdb', server);
      var that = this;
      newdb.open(function (err, db) {
         if (err) {
            console.log(err);
         } else {
            that.db = db
         }   
         if (callback) {
            callback(err, db);
         }
         return;
      })
   }
   return this;
}

function createUser(user, callback) {
   myCb = function (message) {
      return function(err, result){ 
         if (err) {
            console.log(err);
         } else { 
            console.log(message, user.email);
         }
         if (callback) {
            callback(err, result);
         }
         return;
     }
   }
   if (this.db) {
      this.db.collection('users', function (err, collection) {
         collection.findOne({
            email: user.email
         }, function (err, dbUser) {
            if (!dbUser) {
               collection.insert(user, myCb ('Added User!'))
            } else {                  
               collection.update(dbUser, {
                  $set: user
               }, myCb ('Updated user!'));
            }
         })
      });
   } else {
      console.log('db not open');
   }
   return this;
}

function findUser(email, callback) {
   this.db.collection('users', function (err, collection) {
      collection.findOne({
         email: email
      }, function (err, result) {
         if (result === null) {
            console.log("Did not find user!", email);
            if (callback) {
               callback(err, result);
               return;
            } else {
               throw err;
            }
         }
         if (callback) {
            callback(err, result);
         }
         console.log('Found User!', result);
         return result;
      })
   })
}

module.exports = {
   init: init,
   createUser: createUser,
   findUser: findUser
};

//module.exports.init(function (err, result) {
//   module.exports.findUser( 'a@a.com', function (err, result) {})
//});
