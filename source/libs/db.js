var util = require('util');
var PubSub = require('./pubsub.js');
var _ = require('underscore');
var mongodb = require('mongodb');
var crypto = require('crypto');

function Db(customServer) {    
    var server;
    var db;
    var failedRequests; // store all requests that haven't been processed
    var self = this;

    // intitalize function    
    // if known contects database object (ex. testing)
    // if it doesnt find calls function to initialize standard

    if (!(this instanceof Db)){
        return new Db();
    };

    function init(customServer){
        customServer = customServer || {};
        _.defaults(customServer, {host:"localhost", port:"27017", dbname:"panthrdb"});        
        self.emit('initializing', customServer);
        return self;
    };
    
    this.on('initializing', function(Server) {
        PubSub.publish('db/initializing',[], this);
        server = new mongodb.Server(Server.host, Server.port, {auto_reconnect: true});
        db = new mongodb.Db(Server.dbname, server);
        var that = this;
        db.on('close', function(){
            that.emit('disconnected');
        });
        this.emit('initialized');
    });

    // a new instance of mongodb is initialized
    this.on('initialized', function() {
        //PubSub.publish('db/initialized', [], this);
        this.emit('connect');
    });

    // connect to the database, call open()
    this.on('connect', function(){
        PubSub.publish('db/connect', [], this);
        db.open(function(err, db){
          if (err) {
            PubSub.publish('error/db/connection/undefined', [], self);
          } else {
            PubSub.publish('db/initialized', [], self);
            self.emit('connected');
          }
        });
    });

    // connection is set up
    this.on('connected', function(){
        // send all failed requests to doRequest
        if (failedRequests) {
                while (failedRequests.length != 0) {
                   var now = requests.shift();
                   doRequest.apply(this, now);
                }
             }
        PubSub.publish('db/connected', [], this);
    });

    // connection is not yet up
    this.on('disconnected', function(){
        PubSub.publish('db/disconnected', [], this);
        this.emit('connect');
    });    

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
    
    // perform only update(), not findOne() anymore
    // reduce from 2 calls to 1 call in the database
    // need to listen to the callback from update() 
    // to determine if the update() succeeds or not
    
    PubSub.subscribe('db/update/user', _.bind(this.updateUser, this));                
    PubSub.subscribe('db/create/user', _.bind(this.createUser, this));                
    PubSub.subscribe('db/find/user', _.bind(this.findUser, this));               
    PubSub.subscribe('db/delete/user', _.bind(this.deleteUser, this));                


    this.on('dbConnectionError', function(user){
        PubSub.publish('error/db/connection/undefined', [user], this);
    });
    this.on('dbUserNotFoundError', function(user){
        PubSub.publish('error/db/user/notFound', [user], this);
    });
    this.on('dbUserNotCreatedError', function(user){        
        PubSub.publish('error/db/user/notCreated', [user], this);
    });

    this.on('userUpdated', function(user){
        PubSub.publish('db/user/updated', [user], this);
    });
    this.on('userCreated', function(user){
        PubSub.publish('db/user/created', [user], this);
    });
    this.on('userFound', function(user){
        PubSub.publish('db/user/found', [user], this);
    });
    this.on('userDeleted', function(user){
        PubSub.publish('db/user/deleted', [user], this);
    });

    
    
    
    
    // PubSub for findUser() method
    PubSub.subscribe('db/find/user', function(data) {
        // publish if findUser() gets called
        PubSub.publish('db/user/found', {});
    });    

    // PubSub for deleteUser() method
    PubSub.subscribe('db/delete/user', function(data) {
        // publish if deleteUser() gets called
        PubSub.publish('db/user/deleted', {});
    });

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
    
    this.doRequest = function(req, callback) {
       if (!this.db) {
          this.requests.push([req, callback]);
       } else {
          var that = this;
          var ourCallBack = function(err, result) {
              callback.call(that, err, req, result);
          };
          req.args.push(ourCallBack); // push our callback, instead of the original callback
          this.db.collection(req.collectionName, function(err, collection) {
             collection[req.methodName].apply(collection, req.args);
          });
       }
    }
    // PubSub for addFriend() method
    PubSub.subscribe('db/add/friend', function(data) {
        // publish if addFriend() gets called
        PubSub.publish('db/friend/added', {});
    });

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

    // PubSub for removeFriend() method
    PubSub.subscribe('db/remove/friend', function(data) {
        // publish if removeFriend() gets called
        PubSub.publish('db/friend/removed', {});
    });

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
    // PubSub for tagFriend() method
    PubSub.subscribe('db/tag/friend', function(data) {
        // publish if tagFriend() gets called
        PubSub.publish('db/friend/tagged', {});
    });

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

    // PubSub for unTagFriend() method
    PubSub.subscribe('db/unTag/friend', function(data) {
        // publish if unTagFriend() gets called
        PubSub.publish('db/friend/unTagged', {});
    });

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

    // PubSub for createStructure() method
    PubSub.subscribe('db/create/structure', function(data) {
        // publish if createStructure() gets called
        PubSub.publish('db/structure/created', {});
    });

    this.createStructure = function(structure, callback) {
        this.doRequest('structures', 'insert', [structure], callback)
    }

    // PubSub for removeStructure() method
    PubSub.subscribe('db/remove/structure', function(data) {
        // publish if removeStructure() gets called
        PubSub.publish('db/structure/removed', {});
    });

    this.removeStructure = function(structure, callback) {
        /*
            what if we delete something that is an essential part of a structure
            e.g. the x-component of a graph
        */
        var structureID = structure._id;        
        // then remove the struture itself, the first one encountered
        this.doRequest('structures', 'remove', [{_id: structureID}], callback)
    }

    // PubSub for updateStructure() method
    PubSub.subscribe('db/update/structure', function(data) {
        // publish if createStructure() gets called
        PubSub.publish('db/structure/updated', {});
    });

    this.updateStructure = function(structure, changes, callback) {
        // get the string id of the structure
        var structureIDStr = structure._id;//.toHexString();
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
        /*queryObj[structureIDStr] = {
            $ne : null 
        };*/
        this.doRequest('structures', 'update', [queryObj, updateObj], callback);
    }
    
    // PubSub for findStructure() method
    PubSub.subscribe('db/find/structure', function(data) {
        // publish if findStructure() gets called
        PubSub.publish('db/structure/found', {});
    });

    // for now, findStructure acts like findOne
    this.findStructure = function(structure, callback) {
        // get the string id of the structure
        var structureIDStr = structure._id;        
        var queryObj = {
            _id : structure._id
        };
        /*queryObj[structureIDStr] = {
            $ne : null 
        };*/
        // expect to receive the 1st match in return
        return this.doRequest('structures', 'findOne', [queryObj], callback);
    }
    this.db = null;
    this.requests = [];
    init();
};
util.inherits(Db, require('events').EventEmitter);
module.exports = Db;

// creating prototype properties for Db
_.extend(Db.prototype, {
  
  updateUser : function(user, changes){
    var request = {
      collectionName:'users',
      methodName:'update',
      args:[{email : user.email}, {$set:changes}, {safe:true}]
    };
    this.doRequest(request, function(error, countOfRecords){
        if (error){
            this.emit('dbConnectionError', error, request);            
        }
        else if (countOfRecords == 0){
            this.emit('dbUserNotFoundError', user);            
        }
        else{
            this.emit('userUpdated', user);    
        }   
    });
    return this;
  },
  
  createUser : function(user){
    var req = {
      collectionName:'users',
      methodName:'update',
      args:[{email : user.email}, {safe:true}]
    };

    this.doRequest(req, function(error, records){
        if (error){
            this.emit('dbConnectionError', error, req);
            //PubSub.publish('error/db/connection/undefined', [], this);
        }
        else if (!records[0]){// no item is inserted to the record array
            this.emit('dbUserNotCreatedError', user);            
        }
        else{
            this.emit('userCreated', user);                
        }
    });        
    return this;
  },
  
  findUser : function(email, fields){    
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
  },

  deleteUser : function(email) {
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

});

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