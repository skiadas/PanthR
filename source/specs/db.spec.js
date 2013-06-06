// Run with 
// jasmine-node specs/db.spec.js --captureExceptions --forceexit
//
var PubSub = require('../libs/pubsub.js').sync();
var _ = require('underscore');
var mockery = require('mockery');
var realMongo = require('mongodb');

// var mongoMock = jasmine.createSpyObj('mongodb',
//     ['Server', 'Db', 'open', 'collection', 'findOne', 'update', 'remove']
// );
var Db = require('../libs/db.js');
var server = {host: 'localhost', port: 27017, dbName: 'testingdb'};

// var mongoserver = new realMongo.Server(server.host, server.port);
// var db_connector = new realMongo.Db(server.dbName, mongoserver, {safe: false});
var client
// db_connector.open(function(err, db) {
//     client = db;
// });

new realMongo.MongoClient(new realMongo.Server(server.host, server.port)).open(function(err, cl) { if (err) {
    console.log("Failed to connect to Server");
} else {
    console.log("Database connection established"); client = cl;} 
} );

// mockery.enable();

describe("The db module", function() {
    it("exposes a constructor", function() {
        expect(Db).toEqual(jasmine.any(Function));
    });
    it("should subscribe to PubSub notifications", function() {
        spyOn(PubSub, 'subscribe').andCallThrough();
        var db = new Db(server);
        expect(PubSub.subscribe).toHaveBeenCalled();
        var subscribed = _(PubSub.subscribe.calls).map(function(x) {return x.args[0]});
        var expected = [ 
            'db/update/user', 'db/create/user', 'db/find/user', 'db/delete/user',
            'db/add/friend', 'db/remove/friend', 'db/tag/friend', 'db/unTag/friend',
            'db/create/structure', 'db/remove/structure', 'db/update/structure', 'db/find/structure'
        ]
        _.each(expected, function(x) {return expect(subscribed).toContain(x)});
        db = null;
        PubSub.reset();
   }); 
   it("should eventually publish 'db/initialized' when it is set up", function(done) {
       spyOn(PubSub, 'publish').andCallThrough();
       var theDb;
       PubSub.subscribe('db/initialized', function(db) {
           if (theDb.db) {
               expect(theDb && theDb.db).toBeTruthy();
               expect(theDb.db.databaseName).toBe(server.dbName);
               theDb = null;
               PubSub.reset();
               done();
           } else {
               console.log("Null db case")
           }
       })
       theDb = new Db(server);
   });
   it("uses a doRequest method to talk to the database", function(done) {
       var user = {email: "a@a.com", name: "John Doe"}  // Work in randomized names and emails
       var requests = [
           { collectionName: 'users', methodName: 'insert', args: [user]},
           { collectionName: 'users', methodName: 'findOne', args: [_(user).pick('email')]},
           { collectionName: 'users', methodName: 'update', 
                args: [_(user).pick('email'), {$set: {name: 'Peter', nick: 'Pete'}}]},
           { collectionName: 'users', methodName: 'remove', args: [_(user).pick('email')]}
       ];
       var testDb = new Db(server);
       waitsFor(function() {
            return client && testDb.db;
       }, "MongoDb client failed to connect", 5000);
       runs(function() {
           var db = client.db(server.dbName);
           db.dropCollection('users', _droppedCollection);
           function _droppedCollection(err, collection) {
               db.createCollection('users', _createdCollection);
           };
           function _createdCollection(err, collection) {
               testDb.doRequest(requests[0], function(err, req, res) {
                   expect(req).toEqual(requests[0]);
                   expect(_.chain(res).pick('email', 'name').isEqual(user)).toBeTruthy();
                   expect(res[0]._id).toBeDefined();
                   // done();
                   _addedUser();
               });
           };
           function _addedUser() {
               db.collection('users', function(err, coll) {
                  coll.findOne(_(requests[0].args[0]).pick('email'), function(err, doc) {
                     expect(err).toEqual(null);
                     expect(doc).not.toBe(null);
                     expect(_.chain(doc).pick('email', 'name').isEqual(user)).toBeTruthy();
                     _foundTheUser();
                  });
               });
           };
           function _foundTheUser() {
               testDb.doRequest(requests[1], function(err, req, res) {
                   expect(req).toEqual(requests[1]);
                   expect(_.chain(res).pick('email', 'name').isEqual(user)).toBeTruthy();
                   expect(res._id).toBeDefined();
                   _updateTheUser();
               });
           };
           function _updateTheUser() {
               testDb.doRequest(requests[2], function(err, req, res) {
                   expect(req).toEqual(requests[2]);
                   _verifyUpdate();
               });
           };
           function _verifyUpdate() {
               db.collection('users', function(err, coll) {
                  coll.findOne(_(requests[2].args).pick('email'), function(err, doc) {
                     expect(err).toEqual(null);
                     expect(doc.email).toEqual(user.email);
                     expect(doc.name).toEqual(requests[2].args[1].$set.name);
                     expect(doc.nick).toEqual(requests[2].args[1].$set.nick);
                     _deleteTheUser();
                  });
               });
           };
           function _deleteTheUser() {
               testDb.doRequest(requests[3], function(err, req, res) {
                   expect(req).toEqual(requests[3]);
                   _verifyDeletion();
               });
           };
           function _verifyDeletion() {
               db.collection('users', function(err, coll) {
                  coll.findOne(_(requests[3].args).pick('email'), function(err, doc) {
                     expect(err).toEqual(null);
                     expect(doc).toEqual(null);
                     done();
                  });
               });
           }
       });
   });
});



describe("The user part of the database", function() {
   it("would request to create a user when db/create/user message is sent", function(done) {
       var h = PubSub.subscribe('db/user/created', function() {
           expect(db.doRequest).toHaveBeenCalled();
           PubSub.unsubscribe(h);
           done()
       });
       var h2 = PubSub.subscribe('error/db', function() {
           console.log("Received an error from the database. This should not have happened.");
           PubSub.unsubscribe(h2);
           done();
       });
       db = new Db(server);
       var req = {
           methodName: 'insert',
           collectionName: 'users',
           args: [{email: 'a@a.com', name: 'Johnny', job: 'student'}]
       };
       spyOn(db, 'doRequest').andCallFake(function(request, callback) {
           expect(request.methodName).toEqual(req.methodName);
           expect(request.collectionName).toEqual(req.collectionName);
           expect(request.args[0]).toEqual(req.args[0]);
           callback.call(db, null, [req.args[0]]);
           return;
       });
       PubSub.publish('db/create/user', [req.args[0]]);
   });
   it("would request to update a user when db/update/user message is sent", function(done) {
       var h = PubSub.subscribe('db/user/updated', function(user) {
          expect(db.doRequest).toHaveBeenCalled();
          expect(user).toEqual(req.args[0]);
          PubSub.unsubscribe(h);
          done()
       });
       var h2 = PubSub.subscribe('error/db', function() {
           console.log("Received an error from the database. This should not have happened.");
           PubSub.unsubscribe(h2);
           done();
       });
       db = new Db(server);
       var req = {
           methodName: 'update',
           collectionName: 'users',
           args: [{email: 'a@a.com'}, {$set: {name: 'John'}}]
       };
       spyOn(db, 'doRequest').andCallFake(function(request, callback) {
          expect(request.methodName).toEqual(req.methodName);
          expect(request.collectionName).toEqual(req.collectionName);
          _(req.args).each(function(item) { expect(request.args).toContain(item)});
          callback.call(db, null, [1]);
       });
       PubSub.publish('db/update/user', req.args);
   });
   it("would request to delete a user when db/delete/user message is sent", function(done) {
       var h = PubSub.subscribe('db/user/deleted', function() {
          expect(db.doRequest).toHaveBeenCalled();
          PubSub.unsubscribe(h);
          done()
       });
       var h2 = PubSub.subscribe('error/db', function() {
           console.log("Received an error from the database. This should not have happened.");
           PubSub.unsubscribe(h2);
           done();
       });
       db = new Db(server);
       var req = {
           methodName: 'remove',
           collectionName: 'users',
           args: [{email: 'a@a.com'}]
       };
       spyOn(db, 'doRequest').andCallFake(function(request, callback) {
          expect(request.methodName).toEqual(req.methodName);
          expect(request.collectionName).toEqual(req.collectionName);
          _(req.args).each(function(item) { expect(request.args).toContain(item)});
          callback.call(db, null, [1]);
       });
       PubSub.publish('db/delete/user', [req.args[0]]);
   });
   describe("has tools for dealing with friends:", function() {
       function IdMock(id) { this.toHexString = function() {return _id;}; };
       var user = { email: "a@a.com", name: "John Doe", _id: new IdMock("a3ae") };
       var friend = { email: 'mark@a.com', name: 'Mark the mark', _id: new IdMock("efef") };
       var circles = ['hanover', 'student', 'statistics'];
       it("would attempt to add a friend when db/add/friend is sent", function(done) {
          var h = PubSub.subscribe('db/friend/added', function() {
             expect(db.doRequest).toHaveBeenCalled();
             PubSub.unsubscribe(h);
             done();
          });
          db = new Db(server);
          var req = {
              methodName: 'update',
              collectionName: 'users',
          };
          spyOn(db, 'doRequest').andCallFake(function(request, callback) {
             expect(request.methodName).toEqual(req.methodName);
             expect(request.collectionName).toEqual(req.collectionName);
             var set = request.args[1].$set;
             expect(set.friends).toBeDefined();
             expect(set.circles).toBeDefined();
             expect(set.friends.efef).toBeDefined();
             expect(
                 _(set.friends.efef).isEqual(
                     _(friend).extend({circles: circles}))
             ).toBeTruthy();
             _(circles).each(function(circle) {
                expect(set.circles[circle]).toBeDefined();
             });
             callback.call(db, null, [1]);
          });
          PubSub.publish('db/add/friend', [user, friend, circles]);
       });
   });
});

