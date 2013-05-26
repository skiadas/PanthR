PubSub = require('../libs/pubsub.js').sync();
describe("The PubSub module", function () {
    var topic
    ,   aKey
    ,   aValue
    ,   foo = { handler: function(obj) {} }
    ,   data = [{a: 5}];
    beforeEach(function() {
        topic = Math.round(10000*Math.random()).toString(16);
        aKey =  Math.round(10000*Math.random()).toString(16);
        aValue = Math.round(10000*Math.random());
        data[0][aKey] = aValue;
        spyOn(foo, 'handler');
    });
    afterEach(function() {
        data = [{}];
    });
    it("has subscribe and publish methods", function() {
        expect(PubSub.subscribe).toBeDefined();
        expect(PubSub.subscribe).toEqual(jasmine.any(Function));
        expect(PubSub.publish).toBeDefined();
        expect(PubSub.publish).toEqual(jasmine.any(Function));
    });
    it("allows publishers to publish a topic even if noone is listening", function() {
       expect(PubSub.publish.bind(PubSub, topic, data)).not.toThrow();
    });
    it("allows subscribers to listen to events with the same 'topic'", function() {
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data);
        expect(foo.handler).toHaveBeenCalled();
    });
    it("allows subscribers to unsubscribe from events", function() {
        var handle = PubSub.subscribe(topic, foo.handler);
        PubSub.unsubscribe(handle);
        PubSub.publish(topic, data);
        expect(foo.handler).not.toHaveBeenCalled();
    });
    it("allows multiple subscribers to subscribe to the same event", function() {
        PubSub.subscribe(topic, foo.handler);
        foo.handler2 = function() {};
        spyOn(foo, 'handler2');
        PubSub.subscribe(topic, foo.handler2);
        PubSub.publish(topic, data);
        expect(foo.handler).toHaveBeenCalled();
        expect(foo.handler2).toHaveBeenCalled();
    });
    it("passes the data provided by the publisher to the subscribers", function() {
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data);
        expect(foo.handler).toHaveBeenCalledWith(data[0]);
    });
    it("allows the publisher to determine the scope of handler execution", function() {
        var that;
        foo.handler = function(obj) { that = this; };
        var scope = {};
        spyOn(foo, 'handler').andCallThrough();
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data, scope);
        expect(that).toEqual(scope);
    });
    it("allows subscribers to subscribe to part of a topic", function() {
        var bigTopic = [topic, Math.round(10000*Math.random()).toString(16)].join("/");
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(bigTopic, data);
        expect(foo.handler).toHaveBeenCalledWith(data[0], bigTopic);
    });
    it("even allows subscribing to an empty topic to listen to all topics", function() {
        var bigTopic = [topic, Math.round(10000*Math.random()).toString(16)].join("/");
        PubSub.subscribe("", foo.handler);
        PubSub.publish(bigTopic, data);
        expect(foo.handler).toHaveBeenCalledWith(data[0], bigTopic);
    });
    it("can go into asynchronous mode", function(done) {
        var that = {};
        PubSub.async();
        foo.handler = function(obj) { 
            expect(this === that).toBe(true);
            expect(obj).toEqual(data);
            done(); 
        };
        spyOn(foo, 'handler').andCallThrough();
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data, that);
        expect(foo.handler).not.toHaveBeenCalled();
    });
    it("can be specified the synchronicity mode on the publish event", function(done) {
        PubSub.sync();
        foo.handler = function(obj) { done(); }
        spyOn(foo, 'handler').andCallThrough();
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data, true);
        expect(foo.handler).not.toHaveBeenCalled();
        PubSub.publish(topic, data, {}, true);
        expect(foo.handler).not.toHaveBeenCalled();
    });
    it("and vice versa, it can make an synchronous publish while in async mode", function() {
        PubSub.async();
        PubSub.subscribe(topic, foo.handler);
        PubSub.publish(topic, data, false);
        expect(foo.handler).toHaveBeenCalled();
        PubSub.publish(topic, data, {}, false);
        expect(foo.handler.calls.length).toEqual(2);
    });
});
