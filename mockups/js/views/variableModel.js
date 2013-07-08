var NumericVariable = Backbone.Epoxy.Model.extend({
	defaults: {
		format_type: 'number',
		format_decimals: 2,
		format_symbol: '$',
		name: 'Var1',
		vals: []
	},
	computeds: {
	    formattedVals: {
	        deps: ['format_decimals', 'format_symbol', 'vals'], 
	        get: function(decs, sym, vals) {
	            var fun = function(x) { return sym + x.toFixed(decs); }
	            return _(vals).map(fun);
	        }
	    }
	},
	constructor: function(vals) {
		if (vals != null && _.isArray(vals)) {
			vals = {vals: vals};
		}
		// console.log(arguments);
		Backbone.Epoxy.Model.apply(this, arguments);
		return this;
	}
});

var TEXT_TMPL = '<h4>Var1</h4><ul class="unstyled"></ul><button>Add</button><input class="edit" type="input"></input>';

var NumericVariableView = Backbone.Epoxy.View.extend({
    // tagName: 'div',
    // className: 'num-var row-fluid span2 pull-left',
    el: '<div class="num-var row-fluid span2 pull-left">' + TEXT_TMPL + '</div>',
    // varTempl: Handlebars.compile(TEXT_TMPL),
	bindings: {
	    "h4": "text:name",
	    "ul": "array:formattedVals"
	},
	events: {
		'click li': 'editItem',
		'blur .edit': 'hideEdit',
		'keyup .edit': 'handleKeypress'
	},
	editItem: function(ev) {
		var item = $(ev.currentTarget),
			value = item.data('value');
		this.$edit.prependTo(item)
			.addClass('editing')
			.val(value)
			.focus();
	},
	hideEdit: function(ev) {
		this.$edit.removeClass('editing');
	},
	handleKeypress: function(ev) {
		if (ev.which === ESC_KEY) { this.$edit.blur(); return; }
		if (ev.which !== ENTER_KEY) { return; }
		var item = this.$edit.parent(),
			oldValue = parseFloat(item.data('value')),
			newValue = parseFloat(this.$edit.val()),
			location = item.index();
		if (newValue !== oldValue && newValue === newValue) { // Needed for NaN
			// We have a changed/new value. Update the model
			var vals = this.model.get('vals');
			vals[location] = newValue;
			this.once('render', function() {
				// After view re-renders, move to next item
				this.$('li')[location + 1].click();
			});
			this.model.trigger('change', this.model, vals);
		}
		if (!item.next('li').click().length) { this.$edit.blur(); }
	}
});

// var VariableCollection = Backbone.Collection.extend({
// 	model: NumericVariable
// });


Handlebars.registerHelper('formatValue', function(value, options) {
	var type = options.type,
		decimals = options.decimals,
		string = options.symbol || '';
	string += value.toFixed(decimals);
	return string;
});


Backbone.Epoxy.binding.addHandler("array", function($element, value) {
    console.log("here!", $element, value, $element.data('arrayValues'));
    $element.data('arrayValues', value);
    $element.html(_(value).map(function(x) { return '<li>' + x + '</li>'; }));
});
TRY A FILTER!!!

// console.log(myVar.toJSON());
myVar = new NumericVariable([1, 4, 6]);
myView = new NumericVariableView({ model: myVar });
myView.render();
// console.log(myView.el);
myVar2 = new NumericVariable([6, 7, 1]);
myVar2.set('name', 'Var2');
myView2 = new NumericVariableView({ model: myVar2 });
myView2.render();

ENTER_KEY = 13;
ESC_KEY = 27;

$(document).ready(function() {
	// console.log("hi there!")
	// console.log(Handlebars)
	$('#app').append(myView.el).append(myView2.el);
});