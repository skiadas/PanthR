var mockery = require('mockery');
mockery.enable();

describe("A database connection", function () {
    
    // inquiring mongodb module 
    // load up db module that RJ made
    // create a test db 
    var mongodb = require('mongodb');
    var server = new mongodb.Server('localhost', 27017, {
        auto_reconnect: true
    });

    // create my own testing database
    var db = new mongodb.Db('testingdb', server);
    
    // making a spy on the callback function
    var testCallBack = null;
        
    beforeEach(function () {        
        testCallBack = {
            callback: function(arg1, arg2) {                
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
        // load module to test
        var dbmod = require('../libs/db.js');
        // expect dbmod has a defined property named 'init' 
        expect(dbmod.init).toBeDefined();
        // expect dbmod has a function called 'init'
        expect(dbmod.init).toEqual(jasmine.any(Function));
        dbmod.init(function(){
            done();            
        });
        //expect(dbmod.init).toNotEqual(jasmine.any(Function));
        mockery.deregisterMock('mongodb');
    });
    
    // set up a spy funct   ion -> check if the function gets called and what arguments have been passed
    
    it("Tracks that the spy was called and its numbers of calls", function() {
        // create my own function
        
        // turn it into a spy function
        
        // asynchronous test, wait until the callback function get called
        
        // ask if it has been called and what arguments it passes
        
     
        runs(function() {
            flag = false;
            console.log('BEING RUN');
            //testCallBack.callback(null, )
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
            //expect(flag).toEqual(true);
        });
    });        
    
    
 // check whether the createUser() function exists and actually creates a new user
    it("should have a createUser() function", function() {
    
    });

});