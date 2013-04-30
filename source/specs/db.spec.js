/**
 * New node file
 */

 describe("A database connection",function() {
 
 
 // inquiring mongodb module 
 // load up db module that RJ made
 // create a test db 
 var mongodb = require('mongodb');
 var server = new mongodb.Server('localhost',:27017, {auto_reconnect: true});
 
 // create my own testing database
 var db = new mongdb.Db('testingdb', server);
 
 // load module to test
 var dbmod = require('db');
 
 beforeEach(function() {
 
 });
 
 afterEach(function() {
 
 });
 
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
 
 
 });