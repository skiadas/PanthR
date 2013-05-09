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
      if (callback) {
         callback(null, this.db);
      }
   } else {
      this.db = 'opening';
      var newdb = new mongodb.Db('panthrdb', server);
      var that = this;
      newdb.open(function(err, db) {
         if (err) {
            console.log(err);
         } else {
            that.db = db
         }
         if (callback) {
            callback(err, db);
         }
         var requests = this.requests;
         if (requests) {
            while (requests.length != 0) {
               var now = requests.shift()
               doRequest.apply(this, now);
            }
         }
         return;
      })
   }
   return this;
}

function myCb(message, user, callback) {
   return function(err, result) {
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

function updateUser(user, changes, callback) {
   if (this.db) {
      this.db.collection('users', function(err, collection) {
         collection.findOne({
            email: user.email
         }, function(err, dbUser) {
            if (dbUser) {
               collection.update(dbUser, {
                  $set: changes
               }, myCb('Updated user!', user, callback));
            } else {
               myCb('Cannot find email address', user, callback)();
            }
         })
      })
   } else {
      console.log('db not open');
   }
   return this;
}

function createUser(user, callback) {
   if (this.db) {
      this.db.collection('users', function(err, collection) {
         collection.findOne({
            email: user.email
         }, function(err, dbUser) {
            if (!dbUser) {
               collection.insert(user, myCb('Added User!', user, callback))
            } else {
               myCb('Failed user already existed', user, callback)();
            }
         })
      });
   } else {
      console.log('db not open');
   }
   return this;
}

function findUser(email, fields, callback) {
   if (fields instanceof Function) {
      callback = fields;
      fields = {};
   }
   this.db.collection('users', function(err, collection) {
      collection.findOne({
         email: email
      }, fields, function(err, result) {
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

function deleteUser(email, callback) {
   this.db.collection('users', function(err, collection) {
      collection.remove({
         email: email
      }, function(err, removed) {
         if (err) {
            console.log('user not deleted!', err);
            if (callback) {
               callback(err, removed);
               return;
            } else {
               throw err;
            }
         }
         if (callback) {
            callback(err, removed);
         }
         console.log('user deleted');
         return removed;
      })
   })
}

function doRequest(collectionName, methodName, args, callback) {
   if (!this.db) {
      this.requests.push([collectionName, methodName, args, callback]);
   } else {
      //console.log(callback);
      //console.log(args);
      args.push(callback);
      this.db.collection(collectionName, function(err, collection) {
         collection[methodName].apply(collection, args);
      });
   }
}

function addFriend(user, friend, circlesArray, callback) {
   var friendStr = 'friends.' + friend._id.toHexString();
   var queryObj = {
      '$set': {}
   };
   queryObj.$set[friendStr] = {
      nick: friend.nick,
      email: friend.email,
      circles: circlesArray
   };
   circlesArray.forEach(function(el) {
      queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
         nick: friend.nick,
         email: friend.email
      };
   });
   var findStr = {
      _id: user._id
   };
   findStr[friendStr] = null;
   //console.log('query', queryObj);
   this.doRequest('users', 'update', [findStr, queryObj], callback)
}
//remove friend - remove them every circle
///circles could have been added 
//need a way to tell it any circles

function removeFriend(user, friend, circleArray, callback) {
   var friendStr = 'friends.' + friend._id.toHexString();
   var queryObj = {
      '$unset': {}
   };
   queryObj.$unset[friendStr] = '';
   circleArray.forEach(function(el) {
      queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
         nick: friend.nick,
         email: friend.email
      };
   });
   var findStr = {
      _id: user._id
   };
   findStr[friendStr] = {
      $ne: null
   };
   console.log('query', queryObj);
   this.doRequest('users', 'update', [findStr, queryObj], callback);
}
//tagFriend into a list of circls

function tagFriend(user, friend, circleArray, callback) {
   var friendStr = 'friends.' + friend._id.toHexString() + '.circles';
   var queryObj = {
      '$set': {},
      '$addToSet': {}
   };
   queryObj.$addToSet[friendStr] = {
      $each: circleArray
   };
   circleArray.forEach(function(el) {
      queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
         nick: friend.nick,
         email: friend.email
      };
   });
   var findStr = {
      _id: user._id
   };
   findStr['friends.' + friend._id.toHexString()] = {
      $ne: null
   };
   console.log('query', queryObj);
   this.doRequest('users', 'update', [findStr, queryObj], callback);
}
//remove friend  from circle

function unTagFriend(user, friend, circleArray, callback) {
   var friendStr = 'friends.' + friend._id.toHexString() + '.circles';
   var queryObj = {
      '$pullAll': {},
      '$unset': {}
   };
   queryObj.$pullAll[friendStr] = circleArray;
   circleArray.forEach(function(el) {
      queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
         nick: friend.nick,
         email: friend.email
      };
   });
   var findStr = {
      _id: user._id
   };
   findStr['friends.' + friend._id.toHexString()] = {
      $ne: null
   };
   console.log('query', queryObj);
   this.doRequest('users', 'update', [findStr, queryObj], callback);
}

function verifyRequest(requestHash, callback) {
   var hash = crypto.createHash('sha512').update(requestHash).digest('hex');
   var findStr = {
      _id: hash
   };
   this.doRequest('resetRequests', 'findOne', [findStr], callback);
}

function resetRequest(email, callback) {
   //store it
   var salt = Math.round((new Date().valueOf() * Math.random())) + '';
   var requestHash = crypto.createHash('sha512').update(salt).digest('hex');
   var hash = crypto.createHash('sha512').update(requestHash).digest('hex');
   this.doRequest('resetRequests', 'insert', [{
      _id: hash,
      email: email,
      date: new Date()
   }], callback);
   return requestHash;
}

function changePassword(email, password, callback) {
   var salt = Math.round((new Date().valueOf() * Math.random())) + '';
   var hashpassword = crypto.createHash('sha512').update(salt + this.password).digest('hex');
   this.password = {
      salt: salt,
      hash: hashpassword
   };
   this.doRequest('users', 'update', [{
      email: email
   }, {
      $set: {
         password: this.password
      }
   }], callback);
}
module.exports = {
   db: null,
   requests: [],
   init: init,
   doRequest: doRequest,
   createUser: createUser,
   findUser: findUser,
   updateUser: updateUser,
   addFriend: addFriend,
   tagFriend: tagFriend,
   unTagFriend: unTagFriend,
   deleteUser: deleteUser,
   removeFriend: removeFriend,
   resetRequest: resetRequest,
   verifyRequest: verifyRequest
};
//module.exports.init();
/*module.exports.init(function(err, result) {
   module.exports.findUser('a@a.com', {
      email: 1,
      nick: 1,
      _id: 1
   }, function(err, result) {
      var me = result;
      module.exports.findUser('b@b.com', {
         email: 1,
         nick: 1,
         _id: 1
      }, function(err, result) {
         var them = result;
         //module.exports.addFriend(me, them, ['ds', 'hanover' , 'stats'], function(err, friend) {
         module.exports.removeFriend(me, them, ['ds', 'hanover' , 'stats'], function(err, friend) {
            //console.log(friend);
         })
      });
   });
});*/