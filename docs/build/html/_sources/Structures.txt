Structures
==========

(This is work in progress. Please sign your questions with @username for easier searching) @skiadas

Structures are used to store information. 

Internally, most if not all of these structures should be following an "observable" pattern, so other entities can be notified of any changes. This information does not have to be part of the published API though. Structures are split into many subgroups.

The main structures are as follows. Most user actions will result in the creation of one of those objects.

:`Data Objects`_: Used to store standard data.
:`Output Objects`_: Used to describe key operations. When a user wants to perform a test/create a table/make a graph, such an object is created. Transferring this object to the server will likely make the server execute the object.
:`Result Objects`_: Used inside Output Objects to store the actual output desired.
:`Other Objects`_: E.g. general preference settings.

Data Objects
------------

Data Objects are used to contain information. All sorts of information.

.. _Variable:
 
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

    - Could use some clarification. Does this refer to the fact that the formulas will differ between R and javascript? @altermattw
        - Yes this needs to be reworked a bit based on my thoughts after writing a lot of the commands section. But the main thinking is this: variables constructed from some combination of other variables will tend to be nested JSON objects. That object would be fed into a simple parser to create a function that given some inputs for the parameters would compute the variable. For example something like adding three variables would in the API be converted to an object like this::

            {
                name: TargetVariablesName,
                values: CachedArrayOfComputedValues,
                formula: {
                    mode: "add",
                    arguments: ["var1Name", "var2Name", "var3Name"]
                }
            }

        A parser could turn that into a function that would be computing the resulting variable from those incoming ones. On the R end this could be as easy as "var1Name + var2Name + var3Name". We want to avoid having to revisit the parser if one of the values in var1Name changes. @skiadas

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
            The distinct numerical values that could appear in the values array for a nominal or ordinal factor. Both Nominal and Ordinal variables encode their values as numeric, but the order of those values only really matters for factors.
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

    ``filter`` or ``logical`` (we should settle on a name):
    
        These are boolean valued variables, that are treated separately. See Filter_.

Dataset
+++++++

Simply holds equal length variables together.

:variables:
    Array of the variable vectors in the dataset. Could contain either the objects themselves or the names of the variables.
:rownames:
    Optional string variable to use as row names.
:filters:
    Array of the names of filters currently active in the dataset.

Model
+++++

Meant to represent regression models, anova models, repeated measures models etc. We should probably be using R's formula paradigm for our models.

TODO: Fill in details here. Determine how this should interact with tests

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

- The "model" level (referring to the data-model-view hierarchy) of statistical results could be designed so that all output except plot images are represented in a "document" format that could be accessed with an editor. Most results would be very simple documents: a title, and then the output, usually printed as a table. But a user could edit the output to add notes.
- Feature: If a user drags one result (e.g., a table) onto another result (e.g., output from a regression), a document is created which contains both of those. The user can add his/her own text.  Additional objects can be dragged into the document. (@altermattw)

.. _Filter:

Filter
++++++

Filters are expressions that can be used to select a subset of the rows in the dataset. A filter is essentially a Variable_ with boolean values. It shares the same keys as variable.

.. _output_object:

Output Objects
--------------

Output Objects contain all the necessary information to generate a dialog box for a type of output, as well as to construct the resulting output. They do not contain the actual result. But they do all contain a ``result`` key which holds the result structure as a `Result Object <result_object>`_. This key will be omitted in the descriptions below.

- Question: How do *Output Objects* differ from *Commands*? @altermattw
    - An Output Objects can almost be called Dialog Objects; they essentially hold the information of what kind of result the user is trying to obtain, and ways to go back to the menu that created that object. *Commands* are more like everyday functions, like those you would find on the right side of the Compute Variable menu in SPSS. You would be using commands for example inside a Descriptive_ object to specify what descriptives you want to show. To put it another way, most if not all of the Commands belong to the jsstats library, while Output Objects are more tied to the UI. @skiadas

- Question: Because Result Objects are stored inside of Output Objects, it seems like a primary function of an Output Object *is* to contain the results of a dialog. It also contains the dialog entries that produced the results, so that a user could click on the result and be given the option of recalling the dialog to make changes. So perhaps its two primary functions are 1) to store the results, and 2) to link the results to dialog entries to facilitate easy recall of the dialog. Because the dialog entries will logically correspond directly to a command that will generate the results, the Output Object could also be considered to store those commands. @altermattw
    - Yes perhaps we don't need Result Objects at all, and maybe we can attach the various "export" and print functionality to Output Objects instead. What I was thinking was along the lines that for instance both Crosstabs and Descriptive objects would have the same Result Object, a Tabular object, and that object would know how to present itself in html code, or to export itself to Word or to a plain text format etc. Similarly while different Graph types might vary a bit on their dialog interface, the corresponding result object has an underlying function to generate the graph and knows how to use that function to create a JPG or PDF or Canvas version of the graph, how to scale it to different resolutions etc. Output Objects on the other hand are tied to the Dialogs, and deal with the components necessary to construct the function that then constructs the actual result that we see printed on the page. Maybe I'm adding an extra layer of abstraction that's not needed there, not sure. @skiadas

For example, an "crosstabs" output object contains information about what variables we want involved in the crosstabs table, whether we want any percentages computed, etc. The "crosstabs" result object, detailed in the next section, contains the actual table of values. A "graph" output object contains information about the components and other settings of the graph, the "graph" result object is the actual graph itself, in some image format or as a canvas object in Javascript.

The ui implementations should have a way to generate a dialog out of an output object and vice versa. The server/stats implementations should have a way to construct the results object out of the output object.

All outputs share some keys:

:panel_variables:
    Array of names of variables to be used as panel variables. All computations will be done separately for each multi-group defined by the values of the panel variables. A separate table will be created for each category combination from these variables.

:panel_placement:
    An array of length matching the panel_variables. Each entry can be "row", "column" or "panel" depending on whether the different group values should create different panels, or whether they would form an extension of the rows/columns. See the examples for more explanation.

:filters:
    An array of any filters to be used to select a subset of cases.

Crosstab
++++++++
A table or possibly a series of tables, providing cross-tabular information.
    
:row_variables:
    Array of names of one or more variables used to form the rows of the table. Multiple variables will be considered as completely separate entities, just placed next to each other in the table. These are expected to be categorical (ordinal/nominal).

:column_variables:
    Array of names of one or more variables used to form the columns of the table. Multiple variables will be considered as completely separate entities, just placed next to each other in the table. These may be ordinal/nominal or scalar. Column variables are treated differently if they are scalars. They are treated as indicating a count.

:relative:
    A nonempty array indicating whether to show counts for each combination, or whether to do percentages relative to the row variable's values, the column variable's values, the panels or the entire set. Possible values: "count" (default), "row", "column", "panel", "dataset". For example to show counts and row percentages, we would use ``["count","row"]``. See the examples for details.

:totals:
    Whether to include row, column and/or panel totals. A (possibly empty) array containing any of the following: "row", "column", "panel", "dataset".

Examples
~~~~~~~~

Consider the following dataset

==== ==== ==== ====
 A    B    C     D
==== ==== ==== ====
M     Y    23    4
F     Y    12    3
M     N    10    6
F     N    4    10
M     Y    6     4
F     Y    3    13
M     N    11   16
F     Y    0     8
M     Y    3     2
==== ==== ==== ====

Then a crosstabs with A as row variable, and B as column variable would produce:

+-------+-----+------+
| Table | B.Y | B.N  |
+==+====+=====+======+
|  | M  |  3  |  2   |
|A +----+-----+------+
|  | F  |  3  |  1   |
+--+----+-----+------+

A crosstabs with A as row variable, C and D as column variables, with ``["count","column"]`` as the setting for ``relative``, with ``["column"]`` as the setting for ``totals``, and with no panel variables, would produce:

+----------+-----+------+
| Table    |  C  |   D  |
+==+=+=====+=====+======+
|  | |Count|  53 |  32  |
|  |M+-----+-----+------+
|  | |Perc |73.6%|48.5% |
|A +-+-----+-----+------+
|  | |Count|  19 |  34  |
|  +F+-----+-----+------+
|  | |Perc |26.4%|51.5% |
|  +-+-----+-----+------+
|  |Tot    |  72 |  66  |
+--+-------+-----+------+

A crosstabs with A as row variable, C and D as column variables, and B as a panel variable with column panel placement, would yield:

+-------+------------+-----------+
|       |    B.Y     |     B.N   |
| Table +-----+------+------+----+
|       |   C |   D  |   C  |  D |
+==+====+=====+======+======+====+
|  |  M |  32 |  10  |   21 | 22 |
|A +----+-----+------+------+----+
|  |  F |  15 |  24  |   4  | 10 |
+--+----+-----+------+------+----+

Descriptive
+++++++++++

Another table-producing object but aimed more at producing descriptive statistics instead. At its core it is given one or more variables, and asked to compute certain descriptive statistics on them, or any other form of aggregation. Perhaps consider calling these Aggregate instead.

:variables:
    An array of the names of the variables to be used.

:descriptives:
    An array of :doc:`Commands` that express the descriptive statistic we are after. But any aggregating function could be used just as well.

:direction:
    "row" or "column", depending as to whether the variables will be laid out across the different rows, with descriptives across the columns, or vice versa.

Example
~~~~~~~

Consider the following dataset

==== ==== ==== ====
 A    B    C     D
==== ==== ==== ====
M     Y    23    4
F     Y    12    3
M     N    10    6
F     N    4    10
M     Y    6     4
F     Y    3    13
M     N    11   16
F     Y    0     8
M     Y    3     2
==== ==== ==== ====

Then a Descriptive with variables ["C","D"], direction "row", panel variable "A" with panel placement row, and descriptives ["mean", "sd", "count"] would produce the following table:

+--------+-----+---------+---------+
| Table  | mean| std.dev |  count  |
+===+====+=====+=========+=========+
|   | C  |10.6 |  7.635  |    5    |
|A.M+----+-----+---------+---------+
|   | D  | 6.4 |  5.55   |    5    |
+---+----+-----+---------+---------+
|   | C  | ... |  ...    |    4    |
|A.F+----+-----+---------+---------+
|   | D  | ... |  ...    |    4    |
+---+----+-----+---------+---------+

Or possibly the C's for the different M's next to each other? We'll need to find a way to express that if we want both possibilities, else we'll need to default to one.

Test
++++

A structure containing information about performing a statistical test.

:mode:
    The test's name (1-sample, 2-sample, anova, etc). TODO: Need to provide concrete list of tests and their input information, though I imagine we'll keep on adding.

Each test would have its own list of keys, depending on its inputs. But likely the following should suffice for most test (though their form might vary for each test):

:variables:
    The (possible array of) variable(s) that the test refers to.

:null:
    The null hypothesis. Its possible form will vary from test to test.

:alternative:
    The alternative hypothesis. Its possible form will vary from test to test.

Graph
+++++

Generic structure representing graphs.
    
:mode:
    Principal type of graph. Other components can be added, but this determines the basic look. Possible types: ``scatter``, ``bar``, ``dot``, ``box``, ``hist``, ``quantile``. Should perhaps add more in the future.
:variables:
    A vector of the names of variables to be used for the x and y axes respectively. Third or higher variables would represent grouping variables.

:xaxis:
    List representing details of the x-axis, to overwrite default choices. The default options are determined from the variable representing the x-axis. Possible keys:

    :label:
        Used to overwrite the x-axis label.
    :limits:
        Vector of length 2 containing explicit range endpoints.
    :ticks:
        Either a vector containing the tick point numbers or an object containing ``values`` and ``labels``.

:yaxis:
    Same as ``xaxis``.
:components:
    An array of extra "components" to add. Each array entry should be a `Graph Component`_.
:settings:
    A ``graph_settings`` object, sets parameters for colors, line widths, lengths etc. These are meant to overwrite general graph settings that are globally defined by the user.

Graph Component
+++++++++++++++

These are individual components to be tacked on existing graphs.

    :mode:
        One of: ``grid``, ``abline``, ``legend``, ``fit``, ``labels``, ``text``. Possibly should add more. The remaining options depend on the type. TODO



.. _result_object:

Result Objects
--------------

These objects are used to store all kinds of results: Tables, descriptive statistics, graphs etc. 
They tend to not be on their own, but as part of a corresponding `Output Object <output_object>`_.

Other Objects
-------------
:settings: Preference settings for how things should appear etc. For now see :doc:`Settings` for details.
    


TODO: Maybe add structures to hold textual information, and "document" type structures. People should be able to create reports right there and then, given the appropriate interface.
