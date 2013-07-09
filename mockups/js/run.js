(function(curl) {

	var config = {
		// baseUrl: '',
        paths: {
            'jquery': 'components/jquery/jquery.js'
        },
		packages: [
			// Define application-level packages
			{ name: 'curl', location: 'components/curl/src/curl' },
			{ name: 'wire', location: 'components/wire', main: 'wire' },
			{ name: 'cola', location: 'components/cola', main: 'cola' },
			{ name: 'when', location: 'components/when', main: 'when' },
			{ name: 'meld', location: 'components/meld', main: 'meld' },
			{ name: 'poly', location: 'components/poly' },
			{ name: 'jqueryui', location: 'components/jquery-ui/ui', main: 'jquery-ui' },
			{ name: 'handlebars', location: 'components/require-handlebars-plugin/', main: 'Handlebars' },
			{ name: 'underscore', location: 'components/lodash/', main: 'lodash.js' },
			{ name: 'backbone', location: 'components/backbone/', main: 'backbone', config: { moduleLoader: 'curl/loader/cjsm11' } },
			{ name: 'epoxy', location: 'components/backbone.epoxy', main: 'backbone.epoxy.js' }
		],
		// Turn off i18n locale sniffing. Change or remove this line if you want
		// to test specific locales or try automatic locale-sniffing.
		locale: false,
		// Polyfill everything ES5-ish
		preloads: ['poly/all']
		// Or, select individual polyfills if you prefer
		//preloads: ['poly/array', 'poly/function', 'poly/json', 'poly/object', 'poly/string', 'poly/xhr']
	};

	curl(config, [
	    'backbone',
	    'js!jquery!order', 'js!jqueryui!order',
	    'js!js/bootstrap.js!order', 
	    'wire!js/main'
	]).then(success, fail);

	// Success! curl.js indicates that your app loaded successfully!
	function success() {
		console.log("curl loaded");
	}
	// Oops. curl.js indicates that your app failed to load correctly.
	function fail (ex) {
		var el, msg;
		// There are many ways to handle errors. This is just a simple example.
		// Note: you cannot rely on any specific library or shim to be
		// loaded at this point.  Therefore, you must use standard DOM
		// manipulation and legacy IE equivalents.
		console.log(ex)
		console.log('an error happened during loading :\'(');
		console.log(ex.message);
		if (ex.stack) console.log(ex.stack);
		el = document.getElementById('errout');
		msg = 'An error occurred while loading: '
			+ ex.message
			+ '. See the console for more information.';
		if (el) {
			// inject the error message
			if ('textContent' in el) el.textContent = msg;
			else el.innerText = msg;
			// clear styling that may be hiding the error message
			el.style.display = '';
			document.documentElement.className = '';
		}
		else {
			throw msg;
		}
	}

})(curl);