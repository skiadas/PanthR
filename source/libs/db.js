var util = require('util');
Db = function() {
    var mongodb = require('mongodb');
    var crypto = require('crypto');
    var server = new mongodb.Server('localhost', 27017, {
       auto_reconnect: true
    });
    // intitalize function
    // input: takes a database object
    // if known contects database object (ex. testing)
    // if it doesnt find calls function to initialize standard

    this.init = function(callback) {
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
    // Local helper function
    var myCb = function(message, user, callback) {
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

    this.updateUser = function(user, changes, callback) {
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

    this.createUser = function(user, callback) {
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

    this.findUser = function(email, fields, callback) {
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

    this.deleteUser = function(email, callback) {
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

    this.doRequest = function(collectionName, methodName, args, callback) {
       if (!this.db) {
          this.requests.push([collectionName, methodName, args, callback]);
       } else {
          args.push(callback);
          this.db.collection(collectionName, function(err, collection) {
             collection[methodName].apply(collection, args);
          });
       }
    }

    this.addFriend = function(user, friend, circlesArray, callback) {
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
       findStr[friendStr] = null
       this.doRequest('users', 'update', [findStr, queryObj], callback)
    }
    //remove friend - remove them every circle
    ///circles could have been added 
    //need a way to tell it any circles

    this.removeFriend = function(user, friend, circleArray, callback) {
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
       this.doRequest('users', 'update', [findStr, queryObj], callback);
    }
    //tagFriend into a list of circls

    this.tagFriend = function(user, friend, circleArray, callback) {
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
       this.doRequest('users', 'update', [findStr, queryObj], callback);
    }
    //remove friend  from circle

    this.unTagFriend = function(user, friend, circleArray, callback) {
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
       this.doRequest('users', 'update', [findStr, queryObj], callback);
    }

    this.verifyRequest = function(requestHash, callback) {
       var hash = crypto.createHash('sha512').update(requestHash).digest('hex');
       var findStr = {
          _id: hash
       };
       this.doRequest('resetRequests', 'findOne', [findStr], callback);
    }

    this.resetRequest = function(email, callback) {
       //store it
       console.log('starting reset request');
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

    this.changePassword = function(email, password, callback) {
       var salt = Math.round((new Date().valueOf() * Math.random())) + '';
       var hashpassword = crypto.createHash('sha512').update(salt + this.password).digest('hex');
       var pwd = {
          salt: salt,
          hash: hashpassword
       };
       this.doRequest('users', 'update', [{
          email: email
       }, {
          $set: {
             password: pwd
          }
       }], callback);
    }

    this.createStructure = function(structure, callback) {
        this.doRequest('structures', 'insert', [structure], callback)
    }

    this.removeStructure = function(structure, callback) {
        /*
            what if we delete something that is an essential part of a structure
            e.g. the x-component of a graph
        */
        var structureID = structure._id;        
        // then remove the struture itself, the first one encountered
        this.doRequest('structures', 'remove', [{_id: structureID}], callback)
    }

    this.updateStructure = function(structure, changes, callback) {
        // get the string id of the structure
        var structureIDStr = structure._id.toHexString();
        // set up the update object and the query object
        var updateObj = {
            '$set':{}
        };
        updateObj.$set(structureIDStr) = {
            type : changes.type,
            owner_id : changes.owner_id,
            parent: changes.parent,
            links: changes.links  
        };
    
        var queryObj = {
            _id : structure._id
        };
        queryObj[structureIDStr] = {
            $ne : null 
        };
        this.doRequest('structures', 'update', [queryObj, updateObj], callback);
    }
    this.db = null;
    this.requests = [];
};
util.inherits(Db, require('events').EventEmitter);
module.exports = new Db();
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