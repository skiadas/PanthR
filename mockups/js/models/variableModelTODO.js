var NumericVariable = Backbone.Model.extend({
	defaults: {
		format: {
			type: 'number',
			decimals: 2,
			symbol: '$'
		},
		name: 'Var1',
		vals: []
	},
	constructor: function(vals) {
		if (vals != null && _.isArray(vals)) {
			vals = {vals: vals};
		}
		console.log(arguments);
		Backbone.Model.apply(this, arguments);
	}
});

var TEXT_TMPL = '<h4>{{name}}</h4><ul class="unstyled">{{#each vals}}<li data-value="{{this}}"><span>{{formatValue this ../format}}</span></li>{{/each}}<li><button>Add</button></li><input class="edit" type="input"></input></ul>';

var NumericVariableView = Backbone.View.extend({
	tagName: 'div',
	className: 'num-var row-fluid span2 pull-left',
	varTempl: Handlebars.compile(TEXT_TMPL),
	initialize: function() {
		this.model.bind('change', _.bind(this.render, this));
	},
	render: function() {
		this.$el.html(this.varTempl(this.model.toJSON()));
		this.$edit = this.$('.edit');
		this.trigger('render', this);
		return this;
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


myVar = new NumericVariable([1, 4, 6]);
console.log(myVar.toJSON());
myView = new NumericVariableView({ model: myVar });
myView.render();
console.log(myView.el);

ENTER_KEY = 13;
ESC_KEY = 27;

$(document).ready(function() {
	console.log("hi there!")
	// console.log(Handlebars)
	$('#app').append(myView.el);
});