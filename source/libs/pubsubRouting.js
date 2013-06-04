// Offers automatic PubSub setup for routing of topics of the form:  subject/:verb/:object
// where :verb acts as a placeholder

// Routing string format:
//
// String accepted as routed strings have the form a/b/c where each of the a, b, c is a word
// representing text to be matched. If they are prepended by a colon, they match any text and
// that text is captured in a key with that name for future reference.
// 
// Filters are allowed as part of the string, that would act on it, for instance
// 'db/:object/past:verb' will call the 'past' filter on verb before forming the string.

var PubSub = require('./pubsub.js'),
    when = require('when'),
    _ = require('underscore');


var filters = {}; // Holds convenience methods for word manipulation
var handlers = {}; // Keeps track of registered handlers so they can be removed later on
function register(subject, protocol) {
    // protocol is an object identifying topic forms accepted, topic forms returned etc
    // Need to specify options for error handling etc
    // Should return a handler than can be used for "deregistering"
    // Protocol options:
    //    subscribe: topic string to subscribe to. Follows routing string format.
    //               Required.
    //    success: topic string used for publishing a successful result.
    //             Required.
    //    failure: topic string used for publishing a failed result.
    //             If omitted, no errors are published.
    //    method: a function that is provided an object of the variables matched
    //            and returns the function to be called. This method will be bound to subject
    //            If method returns a string, the string will be used to look up a function
    //            with that name in subject.
    //            Defaults to concatenating the variable parts introducing CamelCase.
    //            Returned functions are expected to implement a promise interface 
    //            (or else return a value).
    //            This function should return undefined for topics that it does not want
    //            to handle.
    var subscribe = protocol.subscribe,
        values = protocol.values,
        success = protocol.success,
        failure = protocol.failure,
        method = protocol.method || _defaultMethod,
        fixedTopic = subscribe.match(/^([\w\/]+)(?=\/\w*\:|$)/)[0],
        handler = function(data) {
            var args = _.toArray(arguments),
                topic = args.pop(),
                obj = topicToObject(topic, subscribe),
                func = method(obj),
                result;
            if (typeof func !== 'Function') func = subject[func];
            if (!func) return;  // No method to call
            result = when(func.apply(subject, args));
            result.then(function(result) {
                PubSub.publish(objectToTopic(obj, success), [result], subject);
            });
            if (failure)
                result.otherwise(function(error) {
                    if (failure) PubSub.publish(objectToTopic(obj, failure), [error], subject);
                });
            return result;
        };
        PubSub.subscribe(fixedTopic, handler);
        return handler;
}
function deregister(handler) {
    // Deregisters the handler
    PubSub.unsubscribe(handler);
}
function addFilter(name, method) {
    // Allows adding custom methods for manipulating the forms.
    // e.g. past:verb turns verb to past tense
    filters[name] = method;
    return this;
}
function filter(name, string) {
    // returns the filter method with given name
    // If string is provided, calls the filter on it and returns the value
    return (typeof string === 'undefined') ? filters[name] : filters[name](string);
}

function topicToObject(string, pattern) {
    // matches a string against a pattern, and sets object value appropriately.
    // returns false if it didn't match
    var obj = {}, i, m;
    string = string.split('/');
    pattern = pattern.split('/');
    for (i=0; i < pattern.length; i++) {
        m = pattern[i].match(/^(\w*)\:(\w+)$/);
        if (!m) {
            if (pattern[i] !== string[i]) return false; // Mismatch
        } else {
            obj[m[2]] = filter(m[1], string[i]);
        }
    }
    return obj;
}

function objectToTopic(obj, pattern) {
    // Fills in a pattern based on values from object
    return pattern.replace(/(\w*)\:(\w+)/g, function(all, filterName, word) {
        return filter(filterName, obj[word]);
    });
}


// HELPER METHODS
//
// Default method for locating the function to be called back for subscribed topics
// Returns camelCased concatenation of the values of the variables.
function _defaultMethod(obj) {
    var res = [];
    for (k in obj) if (obj.hasOwnProperty(k)) {res.push(obj[k]); }
    return _camelCase(res.join('-'));
}
function _capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}
function _camelCase(string) {
    // Takes a 'dash separated string' and converts it to camel case:
    //  this-is-an-example  -->  thisIsAnExample
    //
    //  It will split on any non-word character
    var arr = string.split(/\W+/), i;
    for (i=1; i < arr.length; i++) arr[i] = _capitalize(arr[i]);
    return arr.join('');
}
function _pastTense(verb) {
    // Converts a verb to its past tense
    // Need to add more irregular verbs
    var irregular = {'find': 'found', 'add': 'added', 'tag': 'tagged'};
    return irregular[verb] || (verb + 'd');
}

addFilter('capitalize', _capitalize);
addFilter('camelCase', _camelCase);
addFilter('past', _pastTense);
addFilter('pastneg', function(string) {return _camelCase(['not', _pastTense(string)].join('-')) });
addFilter('', function(x) { return x; }); // Default method, used when no filter name

module.exports = {
    register: register,
    deregister: deregister,
    addFilter: addFilter,
    filter: filter
}