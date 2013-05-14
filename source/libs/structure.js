

/*var Structure = function(obj) {
    for (i in obj) {
         if (obj.hasOwnProperty(i)) {
            this[i] = obj[i];
         }
    }
};

var struct = new Structure({   
   type: 'wordspace',
   owner_id: {
        email: 'phamd13',
        nick: 'hello',
        pass: 'world'
   },
   parent: null,
   links: new Array()
});

Structure.prototype = {
    print : function(){
        return this.type + ' ' + this.owner_id + ' ' + this.parent + ' ' + this.links;
    },
    create : function(callback) {
        db.createStructure(this, callback);
        return this;
    },
    remove : function(callback) {
        db.removeStructure(this, callback);
        //return this;
    },
    update: function(changes, callback){
        db.updateStructure(this, changes, callback);
        return this;
    },
};*/

var util = require('util');
var events = require('events');
var db = require('./db.js');
var PubSub = require('./pubsub.js');

var Helper = function(){
    

    var That = function(obj){
        for (i in obj){
            if (obj.hasOwnProperty(i)){
                this[i] = obj[i];
            }
        }

    };
    
    // PubSub messaging 
    // create()
    PubSub.subscribe("structure/create", function{
        //it should publish if db.createStructure() gets called
        PubSub.publish('db/create/structure', [], this);
    });
    PubSub.subscribe("db/structure/created", function{
        //it should publish if a new structure is created
        PubSub.publish('structure/created', [], this);
    });

    // remove()
    PubSub.subscribe("structure/remove", function{
        //it should publish if db.removeStructure() gets called
        PubSub.publish('db/remove/structure', [], this);
    });
    PubSub.subscribe("db/structure/removed", function{
        //it should publish if a structure is removed
        PubSub.publish('structure/removed', [], this);
    });

    // update()
    PubSub.subscribe("structure/update", function{
        //it should publish only if structure/updated gets published
        // the reason is the object is already updated, we just need 
        // to listen to when the object is updated in the database
        // Note: how to notify other objects that this object has been updated
        PubSub.publish('structure/updated', [changes], this);
        //PubSub.publish('db/update/structure', {});
    });
    
    // find()
    PubSub.subscribe("structure/findOne", function{
        //it should publish if a structure is found
        PubSub.publish('db/find/structure', [], this);
    });
    PubSub.subscribe("db/structure/found", function{
        //it should publish if a structure is found
        PubSub.publish('structure/found', [], this);
    });
    
    events.EventEmitter.call(That);
    util.inherits(That, events.EventEmitter);
    
    That.prototype = {
        print : function(){
            return this.type + ' ' + this.owner_id + ' ' + this.parent + ' ' + this.links;
        },
        create : function(callback) {
            db.createStructure(this, callback);            
            return this;
        },
        remove : function(callback) {
            db.removeStructure(this, callback);            
            //return this;
        },
        update: function(changes, callback){
            for (i in changes) {
                if (changes.hasOwnProperty(i)) {
                    this[i] = changes[i];
                 }
            }  
            db.updateStructure(this, changes, callback);
            return this;
        }, 
        findOne: function(callback){
            // return the 1st match
            return db.findStructure(this, callback);
        } 
    };
    
    return That;
};

util.inherits(Helper, events.EventEmitter);
module.exports = new Helper();