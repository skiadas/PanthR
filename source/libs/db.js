'use strict';
var util = require('util'),
    PubSub = require('./pubsub.js'),
    _ = require('underscore'),
    mongodb = require('mongodb'),
    crypto = require('crypto'),
    assert = require('assert'),
    when = require('when'),
    nodefn = require("when/node/function"),
    timeout = require('when/timeout'),
    pipeline = require('when/pipeline'),
    poll = require('when/poll');

function Db(customServer) {
    if (!(this instanceof Db)) {
        return new Db(customServer);
    }

    var server, db, failedRequests, // store all requests that haven't been processed
        self = this;

    // intitalize function
    // if known contects database object (ex. testing)
    // if it doesnt find calls function to initialize standard

    function init(customServer) {
        customServer = customServer || {};
        _.defaults(customServer, {
            host: "localhost",
            port: "27017",
            dbName: "panthrdb"
        });
        self.emit('initializing', customServer);
        return self;
    }

    this.on('initializing', function (Server) {
        PubSub.publish('db/initializing', [Server], this);
        server = new mongodb.Server(Server.host, Server.port, {
            auto_reconnect: true
        });
        db = new mongodb.Db(Server.dbName, server, {
            safe: false
        });
        var that = this;
        db.on('close', function () {
            that.emit('disconnected');
        });
        this.emit('initialized');
    });

    // a new instance of mongodb is initialized
    this.on('initialized', function () {
        this.emit('connect');
    });

    // connect to the database, call open()
    this.on('connect', function () {
        PubSub.publish('db/connect', [], this);
        db.open(function (err, db) {
            if (err) {
                PubSub.publish('error/db/connection/undefined', [err], self);
            } else {
                self.db = db;
                PubSub.publish('db/initialized', [db], self);
                self.emit('connected', db);
            }
        });
    });

    // connection is set up
    this.on('connected', function (db) {
        // send all failed requests to doRequest
        if (failedRequests) {
            var now;
            while (failedRequests.length !== 0) {
                now = failedRequests.shift();
                this.doRequest.apply(this, now);
            }
        }
        PubSub.publish('db/connected', [db], this);
    });

    // connection is not yet up
    this.on('disconnected', function () {
        PubSub.publish('db/disconnected', [db], this);
        this.emit('connect');
    });

    // perform only update(), not findOne() anymore
    // reduce from 2 calls to 1 call in the database
    // need to listen to the callback from update()
    // to determine if the update() succeeds or not

    // user methods
    PubSub.subscribe('db/update/user', _.bind(this.updateUser, this));
    PubSub.subscribe('db/create/user', _.bind(this.createUser, this));
    PubSub.subscribe('db/find/user', _.bind(this.findUser, this));
    PubSub.subscribe('db/delete/user', _.bind(this.deleteUser, this));
    // friend methods
    PubSub.subscribe('db/add/friend', _.bind(this.addFriend, this));
    PubSub.subscribe('db/remove/friend', _.bind(this.removeFriend, this));
    PubSub.subscribe('db/tag/friend', _.bind(this.tagFriend, this));
    PubSub.subscribe('db/unTag/friend', _.bind(this.unTagFriend, this));
    // structure methods
    PubSub.subscribe('db/create/structure', _.bind(this.createStructure, this));
    PubSub.subscribe('db/remove/structure', _.bind(this.removeStructure, this));
    PubSub.subscribe('db/update/structure', _.bind(this.updateStructure, this));
    PubSub.subscribe('db/find/structure', _.bind(this.findStructure, this));

    // error listeners
    this.on('dbConnectionError', function (user) {
        PubSub.publish('error/db/connection/undefined', [user], this);
    });
    this.on('dbUserNotFoundError', function (user) {
        PubSub.publish('error/db/user/notFound', [user], this);
    });
    this.on('dbUserNotCreatedError', function (user) {
        PubSub.publish('error/db/user/notCreated', [user], this);
    });
    this.on('dbUserNotDeletedError', function (email) {
        PubSub.publish('error/db/user/notDeleted', [email], this);
    });
    this.on('dbStructureNotFoundError', function (structure) {
        PubSub.publish('error/db/structure/notFound', [structure], this);
    });
    this.on('dbStructureNotCreatedError', function (structure) {
        PubSub.publish('error/db/structure/notCreated', [structure], this);
    });
    this.on('dbStructureNotDeletedError', function (structure) {
        PubSub.publish('error/db/structure/notDeleted', [structure], this);
    });

    // user methods listeners
    this.on('userUpdated', function (user) {
        PubSub.publish('db/user/updated', [user], this);
    });
    this.on('userCreated', function (user) {
        PubSub.publish('db/user/created', [user], this);
    });
    this.on('userFound', function (user) {
        PubSub.publish('db/user/found', [user], this);
    });
    this.on('userDeleted', function (email) {
        PubSub.publish('db/user/deleted', [email], this);
    });

    // friend methods listeners
    this.on('friendAdded', function (user) {
        PubSub.publish('db/friend/added', [user], this);
    });
    this.on('friendRemoved', function (user) {
        PubSub.publish('db/friend/removed', [user], this);
    });
    this.on('friendTagged', function (user) {
        PubSub.publish('db/friend/tagged', [user], this);
    });
    this.on('friendUnTagged', function (user) {
        PubSub.publish('db/user/untagged', [user], this);
    });

    // structure methods listeners
    this.on('structureUpdated', function (structure) {
        PubSub.publish('db/structure/updated', [structure], this);
    });
    this.on('structureCreated', function (structure) {
        PubSub.publish('db/structure/created', [structure], this);
    });
    this.on('structureFound', function (structure) {
        PubSub.publish('db/structure/found', [structure], this);
    });
    this.on('structureRemoved', function (structure) {
        PubSub.publish('db/structure/removed', [structure], this);
    });

    // PubSub for addFriend() method

    //remove friend - remove them every circle
    ///circles could have been added
    //need a way to tell it any circles

    //tagFriend into a list of circls
    // PubSub for tagFriend() method

    //remove friend  from circle

    this.verifyRequest = function (requestHash, callback) {
        var hash = crypto.createHash('sha512').update(requestHash).digest('hex'),
            findStr = {
                _id: hash
            };
        this.doRequest('resetRequests', 'findOne', [findStr], callback);
    };
    this.resetRequest = function (email, callback) {
        //store it
        console.log('starting reset request');
        var salt = Math.round((new Date().valueOf() * Math.random())).toString(),
            requestHash = crypto.createHash('sha512').update(salt).digest('hex'),
            hash = crypto.createHash('sha512').update(requestHash).digest('hex');
        this.doRequest('resetRequests', 'insert', [{
            _id: hash,
            email: email,
            date: new Date()
        }], callback);
        return requestHash;
    };
    this.changePassword = function (email, password, callback) {
        var salt = Math.round((new Date().valueOf() * Math.random())).toString(),
            hashpassword = crypto.createHash('sha512').update(salt + this.password).digest('hex'),
            pwd = {
                salt: salt,
                hash: hashpassword
            };
        this.doRequest('users', 'update', [{
            email: email
        }, {
            $set: { password: pwd }
        }], callback);
    };

    this.db = null;
    this.failedRequests = [];
    init(customServer);
}
util.inherits(Db, require('events').EventEmitter);
module.exports = Db;

// creating prototype properties for Db
_.extend(Db.prototype, {
    dbPromise: function() {
        // Attempts to reach the database, stops trying after 10 seconds
        var fun = function getDb() { return this.db; }.bind(this),
            isDbOn = function isDbOn(theDb) { return (theDb !== null); }
        return timeout(10000, poll(fun, 100, isDbOn));
    },
    doUserRequest: function(methodName, args) {
        return this.doRequest({
            collectionName: 'users',
            methodName: methodName,
            args: args
        });
    },
    doRequest: function (req) {
        var self = this,
            getCollection = function(db) {
                return nodefn.call(db.collection.bind(db), req.collectionName); 
            },
            makeQuery = function(collection) {
                return nodefn.apply(collection[req.methodName].bind(collection), req.args);
            };
        return pipeline([this.dbPromise.bind(this), getCollection, makeQuery]).otherwise(function(error) {
            self.emit('dbConnectionError', error, req);
            throw new Error('Database Connection Error');
        });
    },
    updateUser: function (user, changes) {
        var request = {
            collectionName: 'users',
            methodName: 'update',
            args: [{ email: user.email }, changes, { safe: true }]
        };
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('userUpdated', user);
            } else {
                this.emit('dbUserNotFoundError', user);
            }
        });
        return this;
    },
    createUser: function (user) {
        var self = this;
        return self.doUserRequest('findOne',
            [{ email: user.email }, {email: 1}, { safe: true }]
        ).then(function(found) {
            if (found) { throw new Error('user/exists'); }
            return self.doUserRequest('insert', [user, { safe: true }] );
        }).then(function(records) {
            if (!records[0]) { throw new Error('user/notFound');  }
            return user;
        });
    },
    findUser: function (user) {
        var self = this;
        return self.doUserRequest('findOne', [{email: user.email}, {}, { safe: true }])
            .then(function(result) {
                if (!result) { throw new Error('user/notFound'); }
                return result;
            });
    },
    deleteUser: function (email) {
        var request = {
            collectionName: 'users',
            methodName: 'remove',
            args: [email, { safe: true }]
        };
        this.doRequest(request, function (error, request, countOfRemovedRecords) {
            console.log('countOfRemovedRecords: ', countOfRemovedRecords)
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRemovedRecords) { // no object is removed
                this.emit('userDeleted', email);
            } else {
                this.emit('dbUserNotDeletedError', request);
            }
        });
        return this;
    },
    addFriend: function (user, friend, circlesArray) {
        var friendStr = 'friends.' + friend._id.toHexString(),
            queryObj = { '$set': {} },
            findStr = { email: user.email },
            request = {
                collectionName: 'users',
                methodName: 'update',
                args: [ findStr, queryObj, { safe: true } ]
            };
        queryObj.$set[friendStr] = {
            nick: friend.nick,
            email: friend.email,
            circles: circlesArray
        };
        circlesArray.forEach(function (el) {
            queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick,
                email: friend.email
            };
        });
        findStr[friendStr] = null;
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('friendAdded', user);
            } else {
                this.emit('dbUserNotFoundError', user);
            }
        });
        return this;
    },
    removeFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString(),
            queryObj = { '$unset': {} },
            findStr = { email: user.email },
            request = {
                collectionName: 'users',
                methodName: 'update',
                args: [ findStr, queryObj, { safe: true } ]
            };;
        queryObj.$unset[friendStr] = '';
        circleArray.forEach(function (el) {
            queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick,
                email: friend.email
            };
        });
        findStr[friendStr] = { $ne: null };
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('friendRemoved', user);
            } else {
                this.emit('dbUserNotFoundError', user);
            }
        });
        return this;
    },
    tagFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString() + '.circles',
            queryObj = { '$set': {}, '$addToSet': {} },
            findStr = { email: user.email },
            request = {
                collectionName: 'users',
                methodName: 'update',
                args: [findStr, queryObj, { safe: true }]
            };
        queryObj.$addToSet[friendStr] = { $each: circleArray };
        circleArray.forEach(function (el) {
            queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick,
                email: friend.email
            };
        });
        findStr['friends.' + friend._id.toHexString()] = { $ne: null };
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('friendTagged', user);
            } else {
                this.emit('dbUserNotFoundError', user);
            }
        });
        return this;
    },
    unTagFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString() + '.circles',
            queryObj = { '$pullAll': {}, '$unset': {} },
            findStr = { email: user.email },
            request = {
                collectionName: 'users',
                methodName: 'update',
                args: [findStr, queryObj, { safe: true }]
            };
        queryObj.$pullAll[friendStr] = circleArray;
        circleArray.forEach(function (el) {
            queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick,
                email: friend.email
            };
        });
        findStr['friends.' + friend._id.toHexString()] = { $ne: null};
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('friendUnTagged', user);
            } else {
                this.emit('dbUserNotFoundError', user);
            }
        });
        return this;
    },
    createStructure: function (structure) {
        var request = {
                collectionName: 'structures',
                methodName: 'insert',
                args: [structure, { safe: true }]
            },
            self = this;
        this.doRequest(request, function (error, request, records) {
            if (error) {
                self.emit('dbConnectionError', error, request);
            } else if (!records[0]) { // no item is inserted to the records array
                self.emit('dbStructureNotCreatedError', request);
            } else {
                self.emit('structureCreated', records[0]);
            }
        });
        return this;
    },
    removeStructure: function (structure) {
        /*
        what if we delete something that is an essential part of a structure
        e.g. the x-component of a graph
        */
        var request = {
            collectionName: 'structures',
            methodName: 'remove',
            args: [{ _id: structure._id }, { safe: true }]
        };
        this.doRequest(request, function (error, request, countOfRemovedRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRemovedRecords) { // no object is removed
                this.emit('structureRemoved', structure);
            } else {
                this.emit('dbStructureNotDeletedError', request);
            }
        });
        return this;
    },
    updateStructure: function (structure, changes) {
        var request = {
            collectionName: 'structures',
            methodName: 'update',
            args: [{ _id: structure._id }, changes, { safe: true }]
        };
        this.doRequest(request, function (error, request, countOfRecords) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (countOfRecords) {
                this.emit('structureUpdated', structure);
            } else {
                this.emit('dbStructureNotFoundError', request);
            }
        });
        return this;
    },
    findStructure: function (structure) {
        var request = {
            collectionName: 'structures',
            methodName: 'findOne',
            args: [{ _id: structure._id }, {}, { safe: true }]
        };
        this.doRequest(request, function (error, request, docObject) {
            if (error) {
                this.emit('dbConnectionError', error, request);
            } else if (!docObject) { // docObject is not defined
                this.emit('dbStructureNotFoundError', request);
            } else {
                this.emit('structureFound', docObject);
            }
        });
        return this;
    }
});




/*run mongodb: sudo mongod --config /etc/mongodb.conf --nojournal*/

if (require.main === module) {
    var user = { email: "h5@hu.com", name: "John Doer" },
        user1 = { email: "h4@hu.com", name: "hi" },
        changes = { email: "h5@hu.com", name: "hello" },
        myServer = { host: "localhost", port: "27017", dbName: "foodb" },
        newDB;

    // PubSub.subscribe('db/connected', function () {
    //     newDB.createUser(user);
    // });
    newDB = new Db(myServer);
    // newDB.doRequest({collectionName: 'users', methodName: 'insert', args: [user]})
    newDB.createUser(user)
    .then(function(result) {
        console.log("Result: ",  result);
    }, function(error) {
        console.log("Error: ", error);
    })
    .ensure(function() {console.log("here!"); testFindUser(); });
    var testFindUser = function testFindUser() {
        console.log("testing...")
        newDB.findUser(user1)
        .then(function(result) {
            console.log("Found: ",  result);
        }, function(error) {
            console.log("Error: ", error);
        }).ensure(function() { process.exit(0); })
    }
    // 
    // PubSub.subscribe('db/user/created', function (user) {
    //     var collection = newDB.db.collection('users');
    //     collection.findOne({ email: user.email }, function (err, doc) {
    //         assert.equal(user.email, doc.email);
    //         assert.equal(user.name, doc.name);
    //         newDB.updateUser(user1, changes);
    //         newDB.findUser({ email: user.email });
    //         newDB.deleteUser({ email: user.email });
    //     });
    // });
    // 
    // PubSub.subscribe('db/user/updated', function (user) {
    //     var collection = newDB.db.collection('users');
    //     collection.findOne({ email: user.email }, function (err, doc) {
    //         assert.equal(user.email, doc.email);
    //     });
    // });
    // 
    // PubSub.subscribe('db/user/found', function (email) {
    //     // email is an object
    //     assert.equal(user.email, email.email);
    // });
    // 
    // PubSub.subscribe('db/user/deleted', function (email) {
    //     var collection = newDB.db.collection('users');
    //     collection.findOne(email, function (err, doc) {
    //         assert.equal(null, doc);
    //         process.exit(0);
    //     });
    // });
    // 
    // PubSub.subscribe('error/db/user/notFound', function (user) {
    //     console.log(user, ' does not exist');
    // });
}