var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {
   auto_reconnect: true
});


// intitalize function
// input: takes a database object
// if known contects database object (ex. testing)
// if it doesnt find calls function to initialize standard
function init(dbObject) {
   if (typeof dbObject !== 'undefined') {
      this.db = dbObject;
   } else {
      this.db = new mongodb.Db('panthrdb', server); // default, conects actual database
   }
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
   this.db.open(function (err, db) {
      if(err) throw err;
      db.collection('users',function(err,collection){
         collection.insert(user, function (err, result) {
            if (err) throw err;
            console.log('Added user!', user.email);
            db.close();
         });
      });
   });
   //this.db.close();
   return this;
}

module.exports = {
   init: init,
   createUser: createUser,
   open: open
};

module.exports.init().createUser({email: 'b@a.com'});

