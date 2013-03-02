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

Non-Javascript
++++++++++++++

- Documentation is under ``docs/source``. From that directory, "make html" will build the documentation in html format.
- Documentation uses `reStructuredText format <http://docutils.sourceforge.net/docs/user/rst/quickref.html>`_, and in particular `Sphinx <http://sphinx-doc.org/>`_ and the extensions it provides.
- CSS work should be done in `SASS <http://sass-lang.com/>`_, in the ``source/sass`` folder. The `COMPASS <http://compass-style.org/>`_ framework is being used. Use ``compass watch`` to have the CSS automatically generated as you edit the sass files.
- HTML work should be done in `Jade <http://jade-lang.com/>`_, in the ``source/views`` folder. Run ``node.js compile.js`` to update the HTML files.

Javascript
++++++++++

- Javascript work should all be under the ``source/js`` directory. Work on the client components should go under a ``client`` subdirectory, while work on the server components under a ``server`` subdirectory.
- Client components should use the `can.js <http://canjs.us/>`_ foundation, and `jQuery <http://jquery.com/>`_ for their DOM interaction. You may use `jQuery UI <http://jqueryui.com/>`_ for UI elements. New UI elements should form their own jQuery plugins.
- Client components should be follow the AMD paradigm and be loaded via `RequireJS <http://requirejs.org/>`_.
- Code style conventions that we will follow can be found `here <http://javascript.crockford.com/code.html>`_. Javascript files should be passing `JSLint <http://www.jslint.com/lint.html>`_.
- Above all else, your code is meant to be read and maintained by other people. Write cleanly, avoid "hacks", document code inline, write tests for the code!

