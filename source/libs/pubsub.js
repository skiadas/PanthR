_ = require('underscore');
/**
* Events. Pub/Sub system for Loosely Coupled logic.
* Based on Peter Higgins' port from Dojo to jQuery
* Original code from: https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
*
* Re-adapted to vanilla Javascript
*
* @class Events
*/

//
// Adjusted by skiadas@hanover.edu to be loaded as a node package
//
// Further adjusted to allow "namespacing" of the form "db/subject/verb" etc
// Added synchronous/asynchronous option
// Added a "reset" option

var Events = (function (){
    var cache = {}
    ,   doAsync = true  // Default to asynchronous messaging
    ,   logHandler = null;
    async = function() { doAsync = true; return this; };
    sync = function() { doAsync = false; return this; };
    reset = function(topic) {
        // Removes all handlers for a specific topic. If topic is undefined, removes all handlers
        if (topic == undefined) {
            cache = {};
        } else if (cache[topic]) {
            delete cache[topic];
        }
    };
    // Logging functionality. 
    // Enable with PubSub.log() or PubSub.log(true).
    // Disable with PubSub.log(false)
    log = function(on) { 
        on = on || true;
        if (on) {
            logHandler = this.subscribe('', function logging(args) {
                var fulltopic = arguments[arguments.length-1]
                ,   topic = fulltopic
                ,   listeners = []
                ,   lastPass = false;
                do {
                   if (topic == "") {
                      lastPass = true;
                   };
                   listeners.push([topic, (cache[topic] || []).length]);
                   topic = topic.substring(0, topic.lastIndexOf("/"));
                } while ((topic != "") || (!lastPass));
                console.log("PubSub event. Listeners:", listeners);
            });
        } else {
            Pubsub.unsubscribe(logHandler);
            logHandler = null;
        }
        return this;
    };
    /**
    * Events.publish
    * e.g.: Events.publish("/Article/added", [article], this);
    *
    * @class Events
    * @method publish
    * @param topic {String}
    * @param args {Array}
    * @param scope {Object} Optional
    */
    publish = function (topic, args, scope, async) {
        if ((scope === true) || (scope === false)) {
            // No scope was provided but then third argument will be the async setting
            async = scope;
            scope = this;
        }
        scope = scope || this;
        if ((async) !== false) {
            async = async || doAsync;
        }
        args = args || [];
        var lastPass = false;
        var fulltopic = topic;
        var passingArgs;
        // Goes through each subtopic in order, including the empty subtopic;
        do {
            passingArgs = _.clone(args);
            if (fulltopic != topic) {
                passingArgs.push(fulltopic); // If listening to subtopic, pass fulltopic in
            }
            if (topic == "") {
                lastPass = true;
            };
            if (cache[topic]) {
                var thisTopic = cache[topic]
                ,   i = thisTopic.length - 1;
                if (async) {
                    for (i; i >= 0; i -= 1) {
                        var handler = thisTopic[i];
                        process.nextTick(function() {handler.apply(scope, passingArgs)});
                    }
                } else {
                    for (i; i >= 0; i -= 1) {
                        thisTopic[i].apply( scope, passingArgs);
                    }
                }
            }
            topic = topic.substring(0, topic.lastIndexOf("/"));
        } while ((topic != "") || (!lastPass));
    },
    /**
    * Events.subscribe
    * e.g.: Events.subscribe("/Article/added", Articles.validate)
    *
    * @class Events
    * @method subscribe
    * @param topic {String}
    * @param callback {Function}
    * @return Event handler {Array}
    */
    //
    // If your handler is listening to a subtopic, it should expect the last argument passed back
    // to be the full topic published.
    //
    subscribe = function (topic, callback) {
        if (!cache[topic]) {
            cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback];
    },
    /**
    * Events.unsubscribe
    * e.g.: var handle = Events.subscribe("/Article/added", Articles.validate);
    * Events.unsubscribe(handle);
    *
    * @class Events
    * @method unsubscribe
    * @param handle {Array}
    * @param completly {Boolean}
    * @return {type description }
    */
    unsubscribe = function (handle, completly) {
        var t = handle[0],
        i = cache[t].length - 1;

        if (cache[t]) {
            for (i; i >= 0; i -= 1) {
                if (cache[t][i] === handle[1]) {
                    cache[t].splice(cache[t][i], 1);
                    if(completly){ delete cache[t]; }
                }
            }
        }
    };

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        sync: sync,
        async: async,
        reset: reset,
        log: log
    };
}());

module.exports = Events;