// Db module performance test
var PubSub = require('../libs/pubsub.js').sync()
,   _ = require('underscore')
,   realMongo = require('mongodb')
,   Db = require('../libs/db.js')
,   server = {host: 'localhost', port: 27017, dbName: 'testingdb'};

PubSub.subscribe('db/initialized', _performTests);
PubSub.subscribe('db/user/created', _recordCreated);
PubSub.subscribe('db/user/updated', _recordUpdated);
PubSub.subscribe('db/user/deleted', _recordDeleted);


nobjects = 5;
objects = Array(nobjects);
results = {};
for (i=nobjects;i--;) objects[i] = { email: _randomString(50), name: i };
for (i=nobjects;i--;) results[objects[i].email] = [];
new Db(server);

function _randomString(length) {
    length = length || Math.round(1000*Math.random());
    var buf = Buffer(length), i;
    for (i=length; i--;) buf[i] = Math.round(92*Math.random()) + 32;
    return buf.toString();
}


function _performTests() {
    console.log("Db initialized")
    for (i=nobjects; i--;) {
        process.nextTick(function() { _addEntry(); });
    }
}
index = 0;
function _addEntry() {
    var entry = objects[index++];
    results[entry.email][0] = new Date();
    PubSub.publish('db/create/user', [entry]);
}
function _recordCreated(user) {
    console.log("Getting here!")
    results[user.email][1] = new Date();
    PubSub.publish('db/update/user', [{email: user.email}, {$set: {foo: 'bar'}}]);
}
function _recordUpdated(user) {
    results[user.email][2] = new Date();
    PubSub.publish('db/delete/user',[user.email]);
}
function _recordDeleted(email) {
    results[email][3] = new Date();
    _done();
}
_done = _.after(nobjects, function() {
    console.log("Done!");
    console.log(results);
});