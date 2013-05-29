/*global can Models*/
(function (namespace, undefined) {
    'use strict';

    var ENTER_KEY = 13;
    var Variable = can.Control({
        // Default options
        // defaults : {
            //  view : 'views/variable.mustache'
            // }
    }, {
        // Initialize the values
        init: function () {
            // Render the variable
            this.element.append(can.view(this.options.view, this.options));
        },
        // Listen for when a new Todo has been entered
        '#new-value keyup': function (el, e) {
            var value = can.trim(el.val()).split(/[\,\;\s]+/),
                len = value.length,
                i;
            // console.log(value);
            if (e.keyCode === ENTER_KEY) {
                for (i=0;i < len; i++) {
                    if (value[i] !== '') {
                        new Models.VariableNumber({
                            value : parseFloat(value[i])
                        }).save(function () {
                            el.val('');
                        });
                    }
                }
            }
        },
        // 
        // Handle a newly created Todo
        '{Models.VariableNumber} created': function (list, e, item) {
            this.options.values.push(item);
            // Reset the filter so that you always see your new todo
            this.options.state.attr('filter', '');
        },
        '.value .destroy click': function (el) {
            el.closest('.value').data('value').destroy();
        },
    });

    namespace.Variable = Variable;
})(this);
