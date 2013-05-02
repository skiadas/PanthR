var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {
   auto_reconnect: true
});


// intitalize function
// input: takes a database object
// if known contects database object (ex. testing)
// if it doesnt find calls function to initialize standard

function init(dbObject) {
   if (this.db) {
      this.db.close()
   }
   var newdb = dbObject || new mongodb.Db('panthrdb', server);
   var that = this;
   newdb.open(function (err, db) {
      if (err) throw err;
      that.db = db
   })
   return this;
}

// open database connection

function open() {
   db.open(function (err, db) {
      if (!err) {
         // access or create
         db.collection('users', function (err, collection) {
            if (err) throw err;
            if (collection) console.log('Were In!');
         });
      };
   });
   return this;
}

function createUser(user) {
   if (this.db) {
      this.db.collection('users', function (err, collection) {
         collection.findOne({
            email: user.email
         }, function (err, dbUser) {
            if (!dbUser) {
               collection.insert(user, function (err, result) {
                  if (err) throw err;
                  console.log('Added user!', user.email);
               })
            } else {
               collection.update(dbUser, {
                  $set: user
               }, function (err, result) {
                  console.log('Update User!', user.email);
               })
            }
         })
      });
   } else {
      throw new Error('db not open');
   }
   return this;
}

module.exports = {
   init: init,
   createUser: createUser,
   open: open
};

//module.exports.init()
//setTimeout(function() {module.exports.createUser({email: 'b@a.com', name: 'Ron'})},1000);