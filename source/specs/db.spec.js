var PubSub = require('../libs/pubsub.js');
var _ = require('underscore');
var mockery = require('mockery');
var realMongo = require('mongodb');
var mongoMock = jasmine.createSpyObj('mongodb',
    ['Server', 'Db', 'open', 'collection', 'findOne', 'update', 'remove']
);
var Db = require('../libs/db.js');
var server = {host: 'localhost', port: 27017, dbname: 'testingdb'};

// mockery.enable();

describe("The db module", function() {
    it("exposes a constructor", function() {
        expect(Db).toEqual(jasmine.any(Function));
    });
    it("should subscribe to PubSub notifications", function() {
        spyOn(PubSub, 'subscribe').andCallThrough();
        new Db(server);
        expect(PubSub.subscribe).toHaveBeenCalled();
        var subscribed = _(PubSub.subscribe.calls).map(function(x) {return x.args[0]});
        var expected = [ 
            'db/update/user', 'db/create/user', 'db/find/user', 'db/delete/user',
            'db/add/friend', 'db/remove/friend', 'db/tag/friend', 'db/unTag/friend',
            'db/create/structure', 'db/remove/structure', 'db/update/structure', 'db/find/structure'
        ]
        _.each(expected, function(x) {return expect(subscribed).toContain(x)});
   }); 
   it("should eventually publish 'db/initialized' when it is set up", function(done) {
       spyOn(PubSub, 'publish').andCallThrough();
       PubSub.subscribe('db/initialized', function() {
           done();
       })
       new Db(server);
   });
   it("uses a doRequest method to talk to the database", function(done) {
       // Need to add checks here that doRequest can perform operations on the testing database
       done()
   });
   it("would request to create a user when db/create/user message is sent", function(done) {
       PubSub.subscribe('db/user/created', function() {
           
           expect(db.doRequest).toHaveBeenCalled();
           console.log(db.doRequest.calls);
           done()
       });
       db = new Db(server);
       var req = {
           methodName: 'create',
           collectionName: 'users',
           args: [{email: 'a@a.com'}]
       };
       spyOn(db, 'doRequest');
       PubSub.publish('db/create/user', req.args[0]);
   });
   it("would request to update a user when db/create/user message is sent", function(done) {
       PubSub.subscribe('db/user/updated', function() {

          expect(db.doRequest).toHaveBeenCalled();
          console.log(db.doRequest.calls);
          done()
       });
       db = new Db(server);
       var req = {
           methodName: 'update',
           collectionName: 'users',
           args: [{email: 'a@a.com'}, {$set: {name: 'John'}}]
       };
       spyOn(db, 'doRequest');
       PubSub.publish('db/update/user', req.args[0]);
   });
   it("would request to delete a user when db/delete/user message is sent", function(done) {
       PubSub.subscribe('db/user/deleted', function() {

          expect(db.doRequest).toHaveBeenCalled();
          console.log(db.doRequest.calls);
          done()
       });
       db = new Db(server);
       var req = {
           methodName: 'remove',
           collectionName: 'users',
           args: [{email: 'a@a.com'}]
       };
       spyOn(db, 'doRequest');
       PubSub.publish('db/delete/user', req.args[0]);
   });
   
});


return;
describe("A database connection", function () {
    
    // inquiring mongodb module 
    // load up db module that RJ made
    // create a fake server (empty object) 
    var server = {};
    // create my own testing database
    var db = {
        open:function(arg){            
            arg(null, db);   
        }
    };
    
    beforeEach(function () {       
        mockery.registerAllowable('../libs/db.js', true);        
    });

    afterEach(function () {
        mockery.deregisterAllowable('../libs/db.js');
    });

    // create my own mock 
    it("Create mock database for init()", function (done) {
        var mongodbmock = {
            Server: function (host, port, optional) {
                expect(host).toEqual('localhost');
                expect(port).toEqual(27017);
                expect(optional).toEqual({
                    auto_reconnect: true
                });                
                return server;
            },
            Db: function(databaseName, config){
                expect(databaseName).toEqual('panthrdb');
                expect(config).toEqual(server);      
                return db;
            }
        };
        
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
        // expect dbmod has a defined property named 'init' 
        expect(dbmod.init).toBeDefined();
        // expect dbmod has a function called 'init'
        expect(dbmod.init).toEqual(jasmine.any(Function));
        dbmod.init(function(){
            done();
        });
        mockery.deregisterMock('mongodb');
    });
    
    // set up a spy function -> check if the function gets called and what arguments have been passed
    
    it("Test if the callback function was called with proper arguments", function() {
        // create my own function        
        // turn it into a spy function        
        // asynchronous test, wait until the callback function get called        
        // ask if it has been called and what arguments it passes
        
        var mongodbmock = {
            Server: function (host, port, optional) {
                return server;
            },
            Db: function(databaseName, config){
                return db;
            }
        };
        
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
         
        var testCallBack = {
            callback: function(arg1, arg2) {                                                
            }
        };
        spyOn(testCallBack, 'callback');
             
        runs(function() {
            flag = false;
            setTimeout(function() {
                flag = true;
            }, 100);
        });
    
        waitsFor(function() {            
            dbmod.init(testCallBack.callback);
            return flag;
        }, "The callback should be called", 150);
    
        runs(function() {
            expect(testCallBack.callback).toHaveBeenCalled();
            expect(testCallBack.callback.mostRecentCall.args[0]).toEqual(null);            
            expect(testCallBack.callback.mostRecentCall.args[1]).toEqual(db);
        });
        mockery.deregisterMock('mongodb');
    });        
    
    
 // check whether the createUser() function exists and gets called
    it("should have a createUser() function", function() {        
        var user = {email: 'phamd13'};        
        
        // findOne finds an existing user, ignores insert
        var collectionMockPos = {
            findOne: function (arg1, arg2) {
                expect(arg1).toEqual({email:user.email});
                expect(arg2).toEqual(jasmine.any(Function)); 
                arg2(null, user);                                       
            },
            insert: function(arg1, arg2){
                expect(arg1).toEqual(user);                                             
            }
        };
        
        // findOne does not find an existing user, proceeds to insert
        var collectionMockNeg = {
            findOne: function (arg1, arg2) {
                expect(arg1).toEqual({email:user.email});
                expect(arg2).toEqual(jasmine.any(Function)); 
                arg2(null, null);                                              
            },
            insert: function(arg1, arg2){
                expect(arg1).toEqual(user);                                             
            }
        };
        
        // create db properties for dbmod in POS case
        var collectionMockForDBPos = {
            collection: function(arg1, arg2) {
                expect(arg1).toEqual('users');
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(null, collectionMockPos);                                
            }
        };
        
        // create db properties for dbmod in NEG case
        var collectionMockForDBNeg = {
            collection: function(arg1, arg2) {
                expect(arg1).toEqual('users');
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(null, collectionMockNeg);                                
            }
        };        
        
        // create mock database 
        var mongodbmock = {
            Server: function (host, port, optional) {
                return server;
            },
            Db: function(databaseName, config){
                return db;
            }
        };
        
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
        
        dbmod.db = collectionMockForDBPos;        
        // expect dbmod has a defined property named 'createUser' 
        expect(dbmod.createUser).toBeDefined();
        // expect dbmod has a function called 'createUser'
        expect(dbmod.createUser).toEqual(jasmine.any(Function));                         
        // spy on the collection method
        spyOn(dbmod.db, 'collection').andCallThrough();
        // spyon the findOne()
        spyOn(collectionMockPos, 'findOne').andCallThrough();
        // spyon the insert()
        spyOn(collectionMockPos, 'insert').andCallThrough();
        // make a call to the createUser()
        dbmod.createUser(user);
        // some tests to check whether functions have been called
        expect(dbmod.db.collection).toHaveBeenCalled();               
        expect(collectionMockPos.findOne).toHaveBeenCalled();        
        
        // the same process, in this case insert() will be called
        dbmod.db = collectionMockForDBNeg;        
        spyOn(collectionMockNeg, 'insert').andCallThrough();
        dbmod.createUser(user);                        
        expect(collectionMockNeg.insert).toHaveBeenCalled();
        mockery.deregisterMock('mongodb');
    });


    // check whether the updateUser() exists and gets called
    it("should have a updateUser() function", function() {        
        var user = {email: 'phamd13'}; 
        var changes = 'changes';       
        
        // findOne finds an existing user, proceeds to update()
        // don't need to worry about the NEG case since 
        // methods get called here
        var collectionMockPos = {
            findOne: function (arg1, arg2) {
                expect(arg1).toEqual({email:user.email});
                expect(arg2).toEqual(jasmine.any(Function)); 
                arg2(null, user);                                       
            },
            update: function(arg1, arg2, arg3){
                expect(arg1).toEqual(user);  
                expect(arg2).toEqual({$set: changes});                                           
            }
        };
        
        // create db properties for dbmod in POS case
        var collectionMockForDBPos = {
            collection: function(arg1, arg2) {
                expect(arg1).toEqual('users');
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(null, collectionMockPos);                                
            }
        };
        
        // create mock database 
        var mongodbmock = {
            Server: function (host, port, optional) {
                return server;
            },
            Db: function(databaseName, config){
                return db;
            }
        };
        
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
                
        dbmod.db = collectionMockForDBPos;        
        // expect dbmod has a defined property named 'updateUser' 
        expect(dbmod.updateUser).toBeDefined();
        // expect dbmod has a function called 'updateUser'
        expect(dbmod.updateUser).toEqual(jasmine.any(Function));                         
        // spy on the collection method
        spyOn(dbmod.db, 'collection').andCallThrough();
        // spyon the findOne()
        spyOn(collectionMockPos, 'findOne').andCallThrough();
        // spyon the insert()
        spyOn(collectionMockPos, 'update').andCallThrough();
        // make a call to the createUser()
        dbmod.updateUser(user, changes);
        // some tests to check whether functions have been called
        expect(dbmod.db.collection).toHaveBeenCalled();               
        expect(collectionMockPos.findOne).toHaveBeenCalled();        
        expect(collectionMockPos.update).toHaveBeenCalled();
        mockery.deregisterMock('mongodb');                               
    });
   
   it("should have a findUser() and get called", function(){        
        var email = 'phamd13';
        var fields = {};
        var result = null;//'phamd13';//null;
        var getCallBack = {
            callback: function(arg1, arg2){
                expect(arg1).toEqual(null);
                expect(arg2).toEqual(result);
            }
        };
        var collectionMock = {
            findOne: function (arg1, arg2, arg3) {
                expect(arg1).toEqual({email:email});
                expect(arg2).toEqual({}); 
                expect(arg3).toEqual(jasmine.any(Function));
                arg3(null, result);                                       
            }          
        };
        
        // create db properties for dbmod in POS case
        var collectionMockForDB = {
            collection: function(arg1, arg2) {
                expect(arg1).toEqual('users');
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(null, collectionMock);                                
            }
        };
        
        // create mock database 
        var mongodbmock = {
            Server: function (host, port, optional) {
                return server;
            },
            Db: function(databaseName, config){
                return db;
            }
        };
        
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
        
        dbmod.db = collectionMockForDB;        
        // expect dbmod has a defined property named 'updateUser' 
        expect(dbmod.findUser).toBeDefined();
        // expect dbmod has a function called 'updateUser'
        expect(dbmod.findUser).toEqual(jasmine.any(Function));                         
        // spy on the collection method
        spyOn(dbmod.db, 'collection').andCallThrough();
        spyOn(getCallBack, 'callback').andCallThrough();
        // spyon the findOne()
        spyOn(collectionMock, 'findOne').andCallThrough();
        // make a call to the findUser()
        dbmod.findUser(email, fields, getCallBack.callback);
        // some tests to check whether functions have been called
        expect(dbmod.db.collection).toHaveBeenCalled();               
        expect(collectionMock.findOne).toHaveBeenCalled();        
        expect(getCallBack.callback).toHaveBeenCalled();
        mockery.deregisterMock('mongodb');
   });
    
    it("should have a deleteUser() and get called", function() {        
        var email = 'phamd13'; 
        var err = null;       
        var removed = null;//'phamd13';//null;
        var getCallBack = {
            callback: function(arg1, arg2){
                expect(arg1).toEqual(null);
                expect(arg2).toEqual(removed);
            }
        };
        var collectionMock = {
            remove: function (arg1, arg2) {
                expect(arg1).toEqual({email:email});                
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(err, removed);                                       
            }          
        };
        
        // create db properties for dbmod in POS case
        var collectionMockForDB = {
            collection: function(arg1, arg2) {
                expect(arg1).toEqual('users');
                expect(arg2).toEqual(jasmine.any(Function));
                arg2(null, collectionMock);                                
            }
        };
        
        // create mock database 
        var mongodbmock = {
            Server: function (host, port, optional) {
                return server;
            },
            Db: function(databaseName, config){
                return db;
            }
        };
        mockery.registerMock('mongodb', mongodbmock);
        var dbmod = require('../libs/db.js');
        
        dbmod.db = collectionMockForDB;        
        // expect dbmod has a defined property named 'deleteUser' 
        expect(dbmod.deleteUser).toBeDefined();
        // expect dbmod has a function called 'deleteUser'
        expect(dbmod.deleteUser).toEqual(jasmine.any(Function));                         
        // spy on the collection method
        spyOn(dbmod.db, 'collection').andCallThrough();
        spyOn(getCallBack, 'callback').andCallThrough();
        // spyon the findOne()
        spyOn(collectionMock, 'remove').andCallThrough();
        // make a call to the findUser()
        dbmod.deleteUser(email, getCallBack.callback);
        // some tests to check whether functions have been called
        expect(dbmod.db.collection).toHaveBeenCalled();               
        expect(collectionMock.remove).toHaveBeenCalled();        
        expect(getCallBack.callback).toHaveBeenCalled();
        mockery.deregisterMock('mongodb');
   });  
});