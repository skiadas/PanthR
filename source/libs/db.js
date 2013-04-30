/**
 * New node file
 */
var mongodb = require('mongodb');
var server = new mongodb.Server('localhost',:27017, {auto_reconnect: true});


//intitalize function
//input: takes a database object
//if known contects database object (ex. testing)
//if it doesnt find calls function to initialize standard
function init(dbObject)
{
	if(db.collection(dbObject).find() != true)
	{
		var db = new mongdb.Db('testingdb', server);
		return db;
	}
	//standard function
	//conects actual database
	else
	{
		var db = new mongdb.Db('panthrdb', server);
		return
	}
}

//method 
// open database connection
db.open(function(err, db)
{
  if(!err){
	//access or create
	db.collection('users', function(err,collection){
	  //remove all docs
	  collection.romove(null,{safe : true}, function(err, result){
	    if(!err){
	      var user = creatUser(object);
	      
}

function createUser(userObject)
{
	var user = userObject;
	db.collection('users').insert({
	  id:user.id, fname: user.fname, lname: user.lname, nickname: user.nickname}, 
	  function(err, result) {    
	    if (err) throw err;    
	    if (result) console.log('Added!');
	    
	  });
}




