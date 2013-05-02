var mockery = require('mockery');
var User = require('../libs/user.js');
mockery.enable();

describe("An user check \n",function() {
    // for later use to mock dependent modules
    /*
    beforeEach(function() {
        mockery.registerAllowable('./libs/user.js', true);
    });
    
    afterEach(function() {
        mockery.deregisterAllowable('./libs/user.js');
    });
    */
     
    // create a test user 
    //var a = new User({_id:'phamd13',fname:'Dung', lname:'Pham'}); 
 
    // check whether the createUser() function exists and actually creates a new user
    it("User should be a constructor function", function() {
        //console.log(User);
        expect(User).toEqual(jasmine.any(Function))
        
        
    });
    
    it("User should have some functionalities", function() {
        var a = new User({_id:'phamd13',fname:'Dung', lname:'Pham'});
        expect(a._id).toEqual('phamd13');
        expect(a.fname).toEqual('Dung');
        expect(a.lname).toEqual('Pham');
        expect(a.print).toBeDefined();        
    });
    
    it("User should print a name", function() {
        var a = new User({_id:'phamd13',fname:'Dung', lname:'Pham'});
        expect(a.print()).toEqual('Dung Pham');
    });  
 }); 

 
 
 