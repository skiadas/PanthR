

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

var Helper = function(){
    

    var That = function(obj){
        for (i in obj){
            if (obj.hasOwnProperty(i)){
                this[i] = obj[i];
            }
        }

    };
    
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
            db.updateStructure(this, changes, callback);
            return this;
        }
    };
    
    return That;
};

util.inherits(Helper, events.EventEmitter);
module.exports = new Helper();
