PubSub = require('../libs/pubsub.js').sync().log();
Routing = require('../libs/pubsubRouting.js');

describe('The PubSub router', function() {
    it('subscribes for appropriate topics', function() {
        var foo = {toyExample: function() {} };
        spyOn(foo, 'toyExample').andReturn(5);
        var handler = Routing.register(foo, {
            subscribe: 'db/:verb/:object',
            success: 'db/:object/pastneg:verb',
            error: 'error/db/:object/:verb'
        });
        PubSub.publish('db/toy/example', [2]);
        expect(foo.toyExample).toHaveBeenCalled();
    });
});
