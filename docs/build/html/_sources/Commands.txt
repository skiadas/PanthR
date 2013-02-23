Commands
========

Executes are commands that manipulate structures. They can also be used to create new structures.
Some of the "structures" above should possibly be refactored as executes.

For now, here's a list of possible "executes".

:newvar:
    Creates a new variable, typically using a formula. This can be used to overwrite an existing variable.
:restructure:
    Change from long to wide format or vice versa. Should be able to take as input a dataset, and produce a new dataset.
:create_graph:
:set_graph_settings:
:create_report:
:read:
    Used to read a new dataset out of a csv or similar file. (CSV, Excel, tab-separated)
:write:
    Used to export a dataset or variable to a file.
:export_graph:
    Used to save a graph structure to a specified format (JPG, PNG, PDF, other?)
:export_report:
    Saves a report in various formats (HTML, ASCII, Excel)

Functions
+++++++++
Functions are a special case of executes. They are typically used as part of another execute, e.g. ``newvar``. *Functions always return a meaningful value, and have no side-effects*. A lot of these should resemble built-in R functions.

:sum:
    Adds a list of variables. Should take arguments regarding possible weights, how to recycle short variables, how to deal with missing values.
:seq:
    Creates a variable as a sequence of numbers. Could also allow for other kinds of patterns, e.g. dates?
:rep:
    Creates a variable by repeating an existing variable in a prescribed way.
:sample:
    Produces a random sample from a given set of values. Can allow for repetition, or for a specified distribution to use (normal, F, etc)
:apply:
    Acts much like R's apply.
:expression:
    Used for basic algebraic manipulations of variables. Would allow other functions as part of it.


TODO need a whole lot more functions
