var mockery = require('mockery');
mockery.enable();

describe("Testing for structure.js", function () {
    
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
    it("Load mock database from db.js", function () {
        var dbmock = {
            createStructure: function (arg1, arg2) {
                //return server;
            },
            removeStructure: function(arg1, arg2){
                //return db;
            },
            updateStructure: function(arg1, arg2, arg3){
            }
        };
        
        mockery.registerMock('../libs/db.js', dbmock);
        //console.log('dbmock IS: ' + dbmock);
        var structmod = require('../libs/structure.js');
        //console.log('structmod IS: ' + structmod);
        // expect dbmod has a defined property named 'init'
        expect(structmod.prototype).toBeDefined(); 
        expect(structmod.prototype.print).toBeDefined();
        expect(structmod.prototype.create).toBeDefined();
        expect(structmod.prototype.remove).toBeDefined();
        expect(structmod.prototype.update).toBeDefined();
        // expect dbmod has a function called 'init'        
        mockery.deregisterMock('../libs/db.js');
    });
});