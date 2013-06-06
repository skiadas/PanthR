PanthR project information
==========================

The project is hosted at https://github.com/skiadas/PanthR

Information for Contributors
----------------------------

Tools you will need to install
++++++++++++++++++++++++++++++

You will need access to the following programs:

- `Node.js <http://nodejs.org/>`_, including the `Express <http://expressjs.com/>`_ framework and its dependencies.
- `Python <http://www.python.org/>`_ and `Sphinx <http://sphinx-doc.org/>`_ and its dependencies in order to compile documentation.
- `Ruby <http://www.ruby-lang.org/en/>`_, `SASS <http://sass-lang.com/>`_, `COMPASS <http://compass-style.org/>`_, for CSS related work.

In order to compile the program, run tests etc, there are a number of dependencies that are required. The following commands, executed from within the 'source' folder, should install these dependencies:

    npm install -g yo grunt-cli bower
    npm install
    bower install

Non-Javascript
++++++++++++++

- Documentation is under ``docs/source``. From that directory, "make html" will build the documentation in html format.
- Documentation uses `reStructuredText format <http://docutils.sourceforge.net/docs/user/rst/quickref.html>`_, and in particular `Sphinx <http://sphinx-doc.org/>`_ and the extensions it provides.
- CSS work should be done in `SASS <http://sass-lang.com/>`_, in the ``source/public/sass`` folder. The `COMPASS <http://compass-style.org/>`_ framework is being used. Use ``compass watch`` to have the CSS automatically generated as you edit the sass files.
- For HTML "static" files, you have two options: Either a static .html file stored in ``source/public`` or preferably in `Jade <http://jade-lang.com/>`_, in the ``source/views`` folder. Run ``node.js compile.js`` to update the HTML files.
- Template files to be used with MV* should probably be in Mustache.js or Handlebars.js format, and placed in ``source/views``.

Javascript
++++++++++

- Javascript work should all be under the ``source/public/javascripts`` directory for client components, or under ``source/libs`` for server components.
- Client components should use the `can.js <http://canjs.us/>`_ foundation, and `jQuery <http://jquery.com/>`_ for their DOM interaction. You may use `jQuery UI <http://jqueryui.com/>`_ for UI elements. New UI elements should form their own jQuery plugins.
- Client components should be follow the AMD paradigm and be loaded via `RequireJS <http://requirejs.org/>`_.
- Code style conventions that we will follow can be found `here <http://javascript.crockford.com/code.html>`_. Javascript files should be passing `JSLint <http://www.jslint.com/lint.html>`_. Use JSHint instead to check things, a tad more lenient and easier to integrate.
- Libraries we want to use that are meant to be used client-side should be installed using 'Bower'. Typically a command line like 'bower install packagename' would do the trick. Alternatively, edit the 'bower.json' file, adding a field in its 'dependencies' dictionary.
- Libraries we want to use that are meant to be used server-side should be installed using npm, and added into the package.json file.
- Above all else, your code is meant to be read and maintained by other people. Write cleanly, avoid "hacks", document code inline, write tests for the code!

Writing Tests
+++++++++++++

- BDD Specs (i.e. unit tests) should go under ``source/specs``. Further subfolders may be created to organize things better.
- We should switch to using Mocha/Chai/Sinon.
- Client side tests should use PhantomJS.

Documentation
+++++++++++++

Need to settle on a format and tools. Tentatively, Docco for inline documentation of some files can work well, and JSDuck for broader documentation. Finally, Sphinx for user guides and other less code-dependent documentation. Or we can use Sphinx instead of JSDuck, need to investigate how well it works with Javascript. Look into `this perhaps <https://github.com/stdbrouw/jsdoc-for-sphinx>`_ or `this <https://github.com/Nuulogic/sphinx-jsapidoc>`_

Building/Testing
++++++++++++++++

The main tool for building the app is 'Grunt', and 'Bower' is used to manage dependencies. You can install them, along with 'Yo' from the Yeoman project, via:

    npm install -g yo grunt-cli bower

The following command line commands should then do nice stuff:

    grunt                   // Compiles the app. Resulting built files go into a 'dist' folder
    grunt test              // Runs all the tests
    grunt server            // Live preview
    grunt clean             // Cleans up the 'dist' folder, deleting all built files
    grunt --help            // Provides info on available commands


Running 'grunt' will also run jshint through the javascript files.
