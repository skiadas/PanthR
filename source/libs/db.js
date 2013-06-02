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
    poll = require('when/poll'),
    delay = require('when/delay'),
    unfold = require('when/unfold');

function _makeHash(text) {
    return crypto.createHash('sha512').update(text).digest('hex');
}
function _makeSalt() {
    return Math.round((new Date().valueOf() * Math.random())).toString();
}

function Db(customServer) {
    if (!(this instanceof Db)) { return new Db(customServer); }

    customServer = customServer || {};
    _.defaults(customServer, { host: "localhost", port: "27017", dbName: "panthrdb" });
    _.extend(this, {
        server: customServer,
        connected: false,
        connecting: false,
        failedRequests: [],
        handler: this.disconnected.bind(this)
    });
    this.setUpRouter();
}
util.inherits(Db, require('events').EventEmitter);
module.exports = Db;

_.mixin({
  capitalize : function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }
});
// creating prototype properties for Db
_.extend(Db.prototype, {
    disconnected: function() {
        console.error('Disconnected!!!');
        if (this.connected) {
            this.db.removeListener('close', this.handler);
            this.connected = false;
            this.connect();
        }
    },
    connect: function () {
        // The promise is never rejected, and is resolved with the 
        // open database connection when it happens.
        //
        //
        // Prevent multiple calls to connnect
        if (this.connecting) { return this.connecting; }
        var self = this,
            counter = 30,
            deferred = when.defer(),
            promise = deferred.promise,
            attempt = function attempt() {
                return nodefn.call(open)
                .then(connected)
                .otherwise(failed);
            }.bind(this),
            connected = function connected() {
                this.db.on('close', this.handler);
                this.connected = true;
                this.connecting = false;
                deferred.resolve(this.db);
            }.bind(this),
            failed = function failed() {
                var timeout = (counter--) ? 1000 : 120000;
                if (!counter) {
                    console.log('Failed to connect. Next attempt in '+ timeout / 1000 + ' seconds.');
                }
                setTimeout(attempt, timeout);
            }.bind(this),
            open;
        // Establish our return value so future calls to connecting can find it
        this.connecting = promise;
        // Reset database
        this.db = new mongodb.Db(
            this.server.dbName,
            new mongodb.Server( this.server.host, this.server.port, { auto_reconnect: true } ),
            { safe: false }
        );
        open = this.db.open.bind(this.db);
        attempt();
        return promise;
    },
    setUpRouter: function() {
        var verbs = ['create', 'delete', 'update', 'find', 'add', 'remove', 'tag', 'untag'],
            handler = this.router.bind(this);
        this.handlers = _(verbs).map(function(verb) { 
            return PubSub.subscribe('db/' + verb, handler); 
        });
    },
    router: function(data) {
        var args = _.toArray(arguments),
            topic = args.pop().split('/'),
            dbName = topic.shift(),
            action = topic.shift(),
            target = topic.shift(),
            pastAction = (action == 'find') ? found : (action + 'd'),
            method = this[action + _.capitalize(target)],
            successTopic = [dbName, target, pastAction].join('/'),
            errorTopic = ['error', dbName, target, 'not' + _.capitalize(pastAction)].join('/');
        method.apply(this, args).then(
            function(result) { PubSub.publish(successTopic, [result]); },
            function(error) {  PubSub.publish(errorTopic, [error]); }
        );
    },
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
    doStructureRequest: function(methodName, args) {
        return this.doRequest({
            collectionName: 'structures',
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
        return pipeline([this.dbPromise.bind(this), getCollection, makeQuery]).otherwise(function(error) { throw new Error('connection'); });
    },
    updateUser: function (user, changes) {
        return this.doUserRequest('update', [{ email: user.email }, changes, { safe: true }])
        .then(function(found) { 
            if (!found[0]) { throw new Error('user/notFound'); }
            return user;
        });
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
        return this.doUserRequest('findOne', [{email: user.email}, {}, { safe: true }])
        .then(function(result) {
            if (!result) { throw new Error('user/notFound'); }
            return result;
        });
    },
    deleteUser: function (user) {
        return this.doUserRequest('remove', [{email: user.email}, { safe: true }])
        .then(function(result) {
            if (!result) { throw new Error('user/notDeleted'); }
            return user;
        });
    },
    addFriend: function (user, friend, circlesArray) {
        var friendStr = 'friends.' + friend._id.toHexString(),
            queryObj = { '$set': {} },
            findStr = { email: user.email };
        queryObj.$set[friendStr] = {
            nick: friend.nick, email: friend.email, circles: circlesArray
        };
        circlesArray.forEach(function (el) {
            queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick, email: friend.email
            };
        });
        findStr[friendStr] = null;
        return this.doUserRequest('update', [ findStr, queryObj, { safe: true } ])
        .then(function(count) {
            if (!count) { throw new Error('user/notFound'); }
            return user;
        });
    },
    removeFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString(),
            queryObj = { '$unset': {} },
            findStr = { email: user.email };
        queryObj.$unset[friendStr] = '';
        circleArray.forEach(function (el) {
            queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick, email: friend.email
            };
        });
        findStr[friendStr] = { $ne: null };
        return this.doUserRequest('update', [ findStr, queryObj, { safe: true } ])
        .then(function(count) {
            if (!count) { throw new Error('user/notFound'); }
            return user;
        });
    },
    tagFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString() + '.circles',
            queryObj = { '$set': {}, '$addToSet': {} },
            findStr = { email: user.email };
        queryObj.$addToSet[friendStr] = { $each: circleArray };
        circleArray.forEach(function (el) {
            queryObj.$set['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick, email: friend.email
            };
        });
        findStr['friends.' + friend._id.toHexString()] = { $ne: null };
            request = {
                collectionName: 'users',
                methodName: 'update',
                args: [findStr, queryObj, { safe: true }]
            };
        return this.doUserRequest('update', [findStr, queryObj, { safe: true }])
        .then(function(count) {
            if (!count) { throw new Error('user/notFound'); }
        });
    },
    unTagFriend: function (user, friend, circleArray) {
        var friendStr = 'friends.' + friend._id.toHexString() + '.circles',
            queryObj = { '$pullAll': {}, '$unset': {} },
            findStr = { email: user.email };
        queryObj.$pullAll[friendStr] = circleArray;
        circleArray.forEach(function (el) {
            queryObj.$unset['circles.' + el + '.' + friend._id.toHexString()] = {
                nick: friend.nick, email: friend.email
            };
        });
        findStr['friends.' + friend._id.toHexString()] = { $ne: null};
        return this.doUserRequest('update', [findStr, queryObj, { safe: true }])
        .then(function(count) {
            if (!count) { throw new Error('user/notFound'); }
            return user;
        });
    },
    createStructure: function (structure) {
        var request = {
                collectionName: 'structures',
                methodName: 'insert',
                args: [structure, { safe: true }]
            },
            self = this;
        return this.doStructureRequest('insert', [structure, { safe: true }])
        .then(function(records) {
            if (!records[0]) { throw new Error('structure/notCreated'); }
            return structure;
        });
    },
    removeStructure: function (structure) {
        return this.doStructureRequest('remove', [{ _id: structure._id }, { safe: true }])
        .then(function(count) {
            if (!count) { throw new Error('structure/notRemoved'); }
            return structure;
        });
    },
    updateStructure: function (structure, changes) {
        return this.doStructureRequest('update', [{ _id: structure._id }, changes, { safe: true }])
        .then(function(count) {
            if (!count) { throw new Error('structure/notFound'); }
            return structure;
        });
    },
    findStructure: function (structure) {
        var request = {
            collectionName: 'structures',
            methodName: 'findOne',
            args: [{ _id: structure._id }, {}, { safe: true }]
        };
        return this.doStructureRequest('findOne', [{ _id: structure._id }, {}, { safe: true }])
        .then(function(found) {
            if (!found) {throw new Error('structure/notFound'); }
            return found;
        });
    },
    verifyRequest: function (requestHash) {
        var findStr = {_id: _makeHash(requestHash) };
        return this.doRequest('resetRequests', 'findOne', [findStr]);
    },
    resetRequest: function (email) {
        var salt = _makeSalt(),
            requestHash = _makeHash(salt),
            hash = _makeHash(requestHash);
        return this.doRequest('resetRequests', 'insert', [{
            _id: hash, email: email, date: new Date()
        }]).then(function() { return requestHash; });
    },
    changePassword: function (email, password) {
        var salt = _makeSalt(),
            hashpassword = _makeHash(salt + this.password),
            pwd = { salt: salt, hash: hashpassword };
        return this.doUserRequest('update', [ { email: email }, { $set: { password: pwd } } ]);
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