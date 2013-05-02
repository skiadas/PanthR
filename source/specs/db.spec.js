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

    beforeEach(function () {
        mockery.registerAllowable('../libs/db.js', true);
    });

    afterEach(function () {
        mockery.deregisterAllowable('../libs/db.js');
    });

    // create my own mock 
    it("Create mock database!", function () {
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
        dbmod.init();
        mockery.deregisterMock('mongodb');
    });

    /*
 // check whether it has an init() function
 it("should have an init() function", function() {
    // expect dbmod has a defined property named 'init' 
    expect(dbmod.init).toBeDefined();
    // expect dbmod has a function called 'init'
    expect(dbmod.init).toEqual(jasmine.any(Function))
 }); 
 
 // check whether the createUser() function exists and actually creates a new user
 it("should have a createUser() function", function() {
 
    
 });
 */

});