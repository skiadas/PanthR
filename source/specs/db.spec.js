var mockery = require('mockery');
mockery.enable();

describe("A database connection", function () {
    
    // inquiring mongodb module 
    // load up db module that RJ made
    // create a test db 
    //var mongodb = require('mongodb');
    var server = 'I am a server'; 
    /*new mongodb.Server('localhost', 27017, {
        auto_reconnect: true
    });*/

    // create my own testing database
    var db = {
        open:function(arg1, arg2){   
            //expect(arg1).toEqual(null);
            //expect(testCallBack.callback).toHaveBeenCalled();         
        }
    };
    
    // making a spy on the callback function for init()
    var testCallBack = null;
    // load module to test
    var dbmod = require('../libs/db.js');
    console.log('dbmod IS: ' + dbmod);
    beforeEach(function () {       
        // specify  
        testCallBack = {
            callback: function(arg1, arg2) {
                expect(arg1).toEqual(null);
                expect(arg2).toEqual(db);                
            }
        };
        spyOn(testCallBack, 'callback');
        mockery.registerAllowable('../libs/db.js', true);
    });

    afterEach(function () {
        mockery.deregisterAllowable('../libs/db.js');
    });

    // create my own mock 
    it("Create mock database!", function (done) {
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
        console.log('dbmod IS: ' + dbmod);
        console.log('dbmod.init IS: ' + dbmod.init);        
        // expect dbmod has a defined property named 'init' 
        expect(dbmod.init).toBeDefined();
        // expect dbmod has a function called 'init'
        expect(dbmod.init).toEqual(jasmine.any(Function));
        //dbmod.init(testCallBack.callback);
        //expect(dbmod.init).toNotEqual(jasmine.any(Function));
        mockery.deregisterMock('mongodb');
    });
    
    // set up a spy function -> check if the function gets called and what arguments have been passed
    
    /*it("Tracks that the spy of the callback function was called", function() {
        // create my own function
        
        // turn it into a spy function
        
        // asynchronous test, wait until the callback function get called
        
        // ask if it has been called and what arguments it passes
             
        runs(function() {
            flag = false;
            setTimeout(function() {
                flag = true;
            }, 100);
        });
    
        waitsFor(function() {
            var dbmod = require('../libs/db.js');
            dbmod.init(testCallBack.callback);
            return flag;
        }, "The callback should be called", 150);
    
        runs(function() {
            expect(testCallBack.callback).toHaveBeenCalled();            
        });
    });*/        
    
    
 // check whether the createUser() function exists and gets called
    /*it("should have a createUser() function", function() {        
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