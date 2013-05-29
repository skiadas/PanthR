/*global can */
(function (namespace, undefined) {
    'use strict';

    var VariableNumber = can.Model.LocalStorage({
        storageName: 'values-canjs'
    }, {
        // Instance methods for the value would go here.
        // Perhaps for effect, try to make it so that negative numbers show with different color?
    });

    // List for Todos
    VariableNumber.List = can.Model.List({
        sum: function () {
            var total = 0;
            this.each(function (val) {
                total += val.attr('value');
            });
            return total;
        },
        count: function() {
            return this.length;
        },
        mean: function () {
            // console.log('Asked to compute mean', this.attr('count'))
            // return (this.attr('sum') / this.attr('count'));
            return this.sum() / this.count();
        },
        sumSquares: function() {
            var total = 0, current;
            this.each(function (val) {
                current = val.attr('value');
                total += current * current;
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
    namespace.Models.VariableNumber = VariableNumber;
})(this);
