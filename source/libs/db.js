var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {
   auto_reconnect: true
});


// intitalize function
// input: takes a database object
// if known contects database object (ex. testing)
// if it doesnt find calls function to initialize standard

function init(dbObject, callback) {
   if (this.db) {
      this.db.close()
   }
   var newdb = dbObject || new mongodb.Db('panthrdb', server);
   var that = this;
   newdb.open(function (err, db) {
      if (err) throw err;
      that.db = db
      if (callback) {
         callback(err, that.db);
      }
   })
   return this;
}

function createUser(user, callback) {
   if (this.db) {
      this.db.collection('users', function (err, collection) {
         collection.findOne({
            email: user.email
         }, function (err, dbUser) {
            if (!dbUser) {
               collection.insert(user, function (err, result) {
                  if (err) throw err;
                  console.log('Added user!', user.email);
                  if (callback) {
                     callback(err, result);
                  }
               })
            } else {
               collection.update(dbUser, {
                  $set: user
               }, function (err, result) {
                  console.log('Update User!', user.email);
                  if (callback) {
                     callback(err, result);
                  }
               })
            }
         })
      });
   } else {
      throw new Error('db not open');
   }
   return this;
}

/*function findUser(email, callback) {
   this.db.collection('users', function (err, collection) {
      collection.findOne({
         email: email
      }, function (err, result) {
         if (err) throw err;
         console.log('Found User!');
         var found = result;
         if (callback) {
            callback(err, result);
         }
      })
   })
   return found;
}*/

module.exports = {
   init: init,
   createUser: createUser,
   findUser: findUser
};

module.exports.init(undefined, function (err, result) {
   module.exports.findUser({
      email: 'b@a.com'
   }, function (err, result) {})
});
