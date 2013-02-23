Structures
==========

Structures are used to store information. 

Internally, most if not all of these structures should be following an "observable" pattern, so other entities can be notified of any changes. This information does not have to be part of the published API though. Structures are split into many subgroups.

Data Objects
------------

Data Objects are used to contain information. All sorts of information.

.. _variable:
 
Variable
++++++++

Represents a variable/vector. Variables can be either "static", where a list of *values* is specified, or "dynamic" where a process for computing them is provided (see :doc:`Commands`). Variables may be on their own or appear inside a dataset.

Variables would contain the following keys:

:values:
    An array of the variable's values, used for static variables. How they are interpreted depends on the variable's "mode". These values will be strings in the case of nominal variables only, otherwise they are numeric. Empty, undefined and null values are all treated as missing values. In case where a variable is specified by a formula, this field may be initially empty, but it will be filled using the formula. In their implementation, formula-based variables need to  observe the objects involved in their formula, and recompute themselves when those objects are altered.

:formula:
    Used for dynamically computed variables. Should be a :doc:`Command <Commands>` object.

:formula_native:
    Should be used by the different implementations for holding a "compiled" version of the function computing the variable. Should be ignored during data transfer. Probably doesn't even need to be mentioned in the API.

:missing:
    An array of values that will be treated as missing values. *Optional*. Perhaps instead of allowing an array of missing values, we would allow the user to designate some values as missing and then actually replace them with null values.

:mode:
    The type of variable: string, ordinal, nominal, scalar, datetime. The type of variable determines the remaining keys:

    ``string``:
        No extra fields needed.
        
    ``scalar``:
    
        :decimals:
            Number of decimal points.
        :format:
            An alternative to decimal points, this would allow for scientific or currency formats. TODO: Hash out the details, use of the standard "format formats" out there.
    
    ``nominal``,
    ``ordinal``:

        :factors:
            The distinct numerical values that could appear in the values array.
        :labels:
            An array of the value labels for the factors appearing in the values array, starting with the label for the number 1.
    
    ``datetime``:
        Date/time values are internally represented as seconds from the beginning of 1970 UTC, also known as Unix Epoch.
        
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

    ``filter``:
    
        These are boolean valued variables, that are treated separately. See :ref:`filter`.

Dataset
+++++++

Simply holds equal length variables together.

:variables:
    Array of the variable vectors in the dataset. Could contain either the objects themselves or the names of the variables.
:rownames:
    Optional string variable to use as row names.
:filters:
    Array of the names of filters currently active in the dataset.

List
++++

Should only be used in a case where variables of unequal length should be grouped together. Ideally we shouldn't need to use lists much.


Workspace
+++++++++

Not strictly speaking a Data Object per se. Workspaces are used to encompass multiple other objects that form a coherent project whole. Whenever a user creates a new object, it's added to the current workspace.

:objects:
    A list of the objects contained in this Workspace.
:next_hash:
    The next available number to be used as a hash. Should start with the value 1 for a new Workspace, and increment by 1 for every new object created.

Document
++++++++

Placed here for future implementations, or if we have time/inclination. A document would be a character string which can be thought of as constituting a "paper". It would be the analog of Sweave in our case. Imagine a document written using reStructuredText or Markdown, with specific "directives" in it to include math equations, graphs, tables, variable values etc. In future versions (or maybe simply later in the process) we could have a small "editor" in place, where users could generate a "lab report" related to their data. This can be converted to a Word document, or PDF, HTML, or be sent straight to a printer etc.

    :attachments:
        For the case of self-contained documents, i.e. those not part of a Workspace but exported on their own, the attachments part would include the appropriate objects to interpret the directives in the document. It will be a list of key-value pairs, the keys being the names of the objects. For instance if a graph is included in the document, the exact image of the graph should be provided in the attachments.

.. _filter:

Filter
++++++
    Filters are expressions that can be used to select a subset of the rows in the dataset. A filter is essentially a :ref:`variable` with boolean values. It shares the same keys as variable.

Result Objects
--------------

These objects are used to store all kinds of results: Tables, descriptive statistics, graphs etc. More so, they contain not just the results, but enough information to reproduce the results. The dialog for creating such an object can be generated from the object itself.

Report
++++++
    A report of descriptives or frequencies for a part of the dataset. TODO: Need to add some examples of the report syntax.
    
    :type:
        The type of report. We need to expand on this. For now: ``frequency``, ``descriptives``. The remaining keys partly depend on the type.
    :variables:
        Array of names of one or more variables that the report refers to. Used to determine the variables on the rows of the table.
    :panel_variables:
        Array of names of variables to be used as panel variables. A separate table will be created for each category combination from these variables.
    :targets:
        Array of expressions to be used for producing the table's columns. Each expression can be either a variable, in which case the appropriate values from that variable are added together to produce the column's values, or an object with a single key. The key is used as the name for the column, while the key's value is a function whose evaluation produces the column's value.

Test
++++
    A structure containing information about a performed statistical test. TODO: Add its fields

Graph
+++++
    Generic structure representing graphs.
    
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
        One of: ``grid``, ``abline``, ``legend``, ``fit``, ``labels``. Possibly should add more. The remaining options depend on the type. TODO


TODO: Maybe add structures to hold textual information, and "document" type structures. People should be able to create reports right there and then, given the appropriate interface.
