/*global can */
(function (namespace, undefined) {
    'use strict';

    var Variable = can.Model.LocalStorage({
        name: 'variable-canjs'
    }, {
        // Instance methods for the value would go here.
        // Perhaps for effect, try to make it so that negative numbers show with different color?
        sum: function () {
            var total = 0;
            this.values.each(function (val) {
                total += val;
            });
            return total;
        },
        count: function() {
            return this.values.length;
        },
        mean: function () {
            // console.log('Asked to compute mean', this.attr('count'))
            // return (this.attr('sum') / this.attr('count'));
            return this.sum() / this.count();
        },
        sumSquares: function() {
            var total = 0, current;
            this.values.each(function (val) {
                total += val * val;
            });
            return total;
        },
        variance: function() {
            return this.sumSquares() / (this.count() -1);
        },
        sd: function () {
            return Math.sqrt(this.variance());
        }
    });

    namespace.Models = namespace.Models || {};
    namespace.Models.Variable = Variable;
})(this);
