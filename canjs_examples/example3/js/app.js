/*global $ Todos Models Mustache can*/
(function () {
	'use strict';
	$(function () {
		// Set up a route that maps to the `filter` attribute
		can.route(':filter');
		// Delay routing until we initialized everything
		can.route.ready(false);

		// View helper for pluralizing strings
		Mustache.registerHelper('plural', function (str, count) {
			return str + (count !== 1 ? 's' : '');
		});
		Mustache.registerHelper('round', function (value, digits) {
            var factor = Math.pow(10, digits);
			return Math.round(value * factor) / factor;
		});
		Mustache.registerHelper('zscore', function(val, mean, sd) {
            console.log("Here!", val, mean, sd)
            return (val-mean)/sd;
        });
	    console.log("About to look")
		// Initialize the app
		Models.Variable.findAll({}, function (variable) {
		    console.log("Found: ", variable)
			new Variable('#myVariable', {
				values: variable,
				state: can.route,
				view : 'views/variable.mustache'
			});
		});

		// Now we can start routing
		can.route.ready(true);
	});
})();
