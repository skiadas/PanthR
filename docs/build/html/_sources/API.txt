Language API
============

Data communication takes place in JSON format. Each JSON object needs to contain the following keys:

    :id:
        The established id for the client.
    :commands:
        An array of one more more objects, each representing a "command". The various available commands listed below.
        We need to arrange things so that addons can create new commands. Ideally this should be done in two levels, in Javascript as well as R.

Commands
~~~~~~~~
Each command has a specific list of expected keys. Any other keys will be ignored. Commands fit in two main types: Structures, and Executes. All commands are represented in the API as a JSON object, with the ``command`` key holding the command's name.

Structures
++++++++++
Structures are used to store information. They all contain the ``name`` key, which is used to refer to them from other variables. Internally, all these structures should be following an "observable" pattern, so other entities can be notified of any changes. This information does not have to be part of the published API though.

:vector:
    Typical building block, represents a variable. Vectors can be either "static", where a list of *values* is specified, or "dynamic" where a process for computing them is provided. Vectors would contain the following keys:

    :name:
        Name for the variable. Need to specify rules for how this is converted to a valid R variable name.
    :label:
        Longer name for the variable. Used on graphs and tables. *Optional*
    :values:
        An array of the vector's values, used for static variables. How they are interpreted depends on the vector's type. These values will be strings in the case of nominal variables only, otherwise they are numeric. Empty, undefined and null values are all treated as missing values. *A vector needs to have either* values *or* formula *specified.* Alternatively, all vectors could be values, but some could have a formula attribute that could be accessed to recompute a variable or simply remind the user how the values were computed.
    :formula:
        Used for dynamically computed vectors. Should be a string representing a function that would compute the variable. Should spell out in a different section the allowed operators/functions.
    :formula_native:
        Should be used by the different implementations for holding a "compiled" version of the function computing the variable. Should be ignored during data transfer.
    :missing:
        An array of values that will be treated as missing values. *Optional*
    :type:
        The type of variable: ordinal, nominal, scalar, datetime. The type of variable determines the remaining keys:
    
        ``scalar:``
        
            :decimals:
                Number of decimal points.
        
        ``ordinal:``
        
            :labels:
                An array of the value labels for the numbers appearing in the values array, starting with the label for the number 1.
        
        ``datetime:``
            Date values are represented as seconds from the beginning of 1970 UTC, also known as Unix Epoch.
            
            :timezone:
                Need to find a way to represent this
                
            :format:
                A string representing how the datetime values should be formatted. Need to provide some rules here, but should probably follow a subset of C's strformat. Initial suggestion:
                
                :y:
                    Year, 2 digits
                :Y:
                    Year, 4 digits
                :b:
                    Month, abbreviated
                :B:
                    Month, long
                :m:
                    Month, numeric
                :d:
                    Day of month, numeric
                :a:
                    Weekday, abbreviated
                :A:
                    Weekday, full
                :H:
                    Hours, 24hour clock
                :I:
                    Hours, 12hour clock
                :M:
                    Minutes
                :S:
                    Seconds
                :p:
                    a.m. or p.m.
                :others:
                    inserted as is

:dataset:
    Organizational structure to hold variable vectors together.
    
    :name:
        Name of the data set
    :label:
        Used in graphs/tables/tests
    :variables:
        Array of the variable vectors in the dataset. Could contain either the objects themselves or the names of the variables.
    :filters:
        Array of the names of filters currently active in the dataset.

:filter:
    Filters are expressions that can be used to select a subset of the rows in the dataset.
    
    :name:
        Name for the filter, that can be used to refer to it.
    :label:
        Used on visualizations of the filter.
    :variables:
        Array of names of the variables involved in this filter's formula
    :formula:
        A string describing a boolean-valued function determining the rows to be filtered.
    :formula_native:
        A native implementation of the formula. Not for transmission.

:report:
    A report of descriptives or frequencies for a part of the dataset. TODO: Need to add some examples of the report syntax.
    
    :name:
        Name of the table, used to refer to it internally.
    :label:
        Visual title for the table.
    :type:
        The type of report. We need to expand on this. For now: ``frequency``, ``descriptives``. The remaining keys partly depend on the type.
    :variables:
        Array of names of one or more variables that the report refers to. Used to determine the variables on the rows of the table.
    :panel_variables:
        Array of names of variables to be used as panel variables. A separate table will be created for each category combination from these variables.
    :targets:
        Array of expressions to be used for producing the table's columns. Each expression can be either a variable, in which case the appropriate values from that variable are added together to produce the column's values, or an object with a single key. The key is used as the name for the column, while the key's value is a function whose evaluation produces the column's value.

:test:
    A structure containing information about a performed statistical test. TODO: Add its fields

:graph:
    Generic structure representing graphs.
    
    :name:
        Used internally.
    :label:
        Graph Title.
    :type:
        Principal type of graph. Other components can be added, but this determines the basic look. Possible types: ``scatter``, ``bar``, ``dot``, ``box``, ``hist``, ``quantile``. Should add more in the future.
    :variables:
        A vector of 2 names of variables to be used for the x and y axes respectively. If a third variable is present, it will be used a a grouping variable.
    :panel_variables:
        Array of names of variables used to create separate panels. First entry represents column panels, second entry row panels, higher entries produce multiple graphs. Use NULL to skip entries.
    :xaxis:
        Object representing details of the x-axis, to overwrite default choices. The defautl options are determined from the variable representing the x-axis. Possible keys:
        
        :label:
            Used to overwrite the x-axis label.
        :limits:
            Vector of length 2 containing explicit range endpoints.
        :ticks:
            Either a vector containing the tick points or an object containing ``values`` and ``labels``.
    
    :yaxis:
        Same as ``xaxis``.
    :components:
        An array of extra "components" to add. Each array entry should be a ``graph_comp``.
    :graph_settings:
        A ``graph_settings`` object, sets parameters for colors, line widths, lengths etc.

:graph_settings:
    TODO

:graph_comp:
    These are individual components to be tacked on existing graphs.
    
    :type:
        One of: ``grid``, ``abline``, ``legend``, ``fit``, ``labels``. Possibly should add more. The remaining options depend on the type.
    TODO

TODO: Maybe add structures to hold textual information, and "document" type structures. People should be able to create reports right there and then, given the appropriate interface.

Executes
++++++++

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
