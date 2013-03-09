Commands
========

(This is work in progress. Please sign your questions with @username for easier searching) @skiadas

Commands are essentially functions. They may serve numerous purposes, from creating new variables to merging datasets to exporting graph objects or tables into various forms. Some Commands are meant to create a new object, others are meant to manipulate existing objects.

**Important**: Commands also may have `name` and `label` keys. Unlike with structures, these are used as the name or label keys for the resulting structures produced by these commands.

Most of these commands would be exposed to the user as parts to use in an interface for constructing new variables from existing ones. Others might be linked to different menus or options. Some are used when e.g. trying to export something.

    - Discussion: There are two ways of implementing "commands" that I see. One is to stick to everything being a JSON object. For instance this means that something as simple as ``foo+bar`` to add two variables would turn into ``{type: "add", variables: ["foo", "bar"]}``. The downside is that it makes some of the saving and transferring of information a bit verbose. The alternative would be to allow expressions like ``mean(c(x,y)) + sd(x)``, then parse those when we need things computed. We should not allow arbitrary expressions to simply be "executed", not without some safeguards, as this would allow users or anyone that can talk to the server to use R's exec function to run arbitrary scripts on the server. So we'll need to be parsing the expression and only using the small of functions described in this section. More straightforward messages, at the cost of more parsing needed at the ends. (@skiadas)

Commands fall into the following categories:

Data Manipulation
+++++++++++++++++
Collection of functions that operate on our data structures and/or create new data structures.

Generic Manipulation Functions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
These are functions that alter their behavior based on their first argument's type.

:summary: Produces a summary object for the entire object
:brief: A briefer summary object of the object
:clone: Makes a copy of an existing object. The copy can be *deep* or *shallow* depending on whether we want the information about how the object came to be to survive. This would be used for instance to *freeze* a variable that was defined via a complicated calculation depending on other variables. As it stands, a variable would update itself when its components change. Freezing gives you just values.

Dataset Manipulation
~~~~~~~~~~~~~~~~~~~~
Functions that operate on whole datasets or that produce datasets.

:restructure: Change from long to wide format or vice versa. Should be able to take as input a dataset, and produce a new dataset.
:merge: Accepts multiple datasets and/or variables, merges them together. Should have settings about how to deal with variable length. This can be used for example to add a variable to a dataset.
:subset: Select a subset of the dataset based on some criteria. Could also be used to replace part of the dataset. (These subset functions should probably be extended to all Structures. They effectively would be playing the role of the indexing functionality ``[`` in R)
:names: Returns a variable of the names of the dataset. Can also be used to set new names, if a second argument is provided.

Variable Manipulation
~~~~~~~~~~~~~~~~~~~~~
Functions that produce or alter variables.

:c: Create a variable just by listing/concatenating existing variables/values.
:rep: Repeat existing variable or pattern to obtain a richer pattern.
:seq: Used for arithmetic progressions.
:subset: Select a subset of the variable based on some criteria. Can be used to instead replace the selected part of the variable if an extra argument is provided.


Output Object Manipulation
~~~~~~~~~~~~~~~~~~~~~~~~~~
Functions that manipulate output objects.

:export: Exports the object into various formats. The available formats would vary with the objects.

Model Manipulation
~~~~~~~~~~~~~~~~~~
Functions that manipulate models.

:coefs: List representing the model's coefficients.
:fitted: Fitted values
:residual: Residuals

List Manipulation
~~~~~~~~~~~~~~~~~
Functions that manipulate lists.

:c: Concatenate lists.
:names: Get or set the names on the list.
:subset: Replace parts of a list or assign to a part of a list.

Operators
+++++++++

Logical
~~~~~~~

:and: Logical AND. Allows more than two arguments
:or:  Logical OR. Allows more than two arguments
:not: Logical NOT
:ge: Greater than
:le: Less than
:geq: Greater than or equal to
:leq: Less than or equal to
:eq: Equal
:all: For a logical variable, returns TRUE if all values are TRUE, FALSE otherwise
:any: For a logical variable, returns TRUE if at least one value is TRUE, FALSE otherwise

Arithmetic
~~~~~~~~~~

:add: Pointwise Addition. Allows more than two arguments. Also allows for weights.
:multiply: Pointwise Multiplication. Allows more than two arguments.
:subtract: Pointwise Difference of two variables. More arguments are successively divided in.
:quotient: Pointwise Quotient of two variables. More arguments are successively divided in.
:power: Pointwise power computation

Date/Time Functions
+++++++++++++++++++
These functions create or manipulate Date/Time variables.

:diff: Computes the difference between two date/time variables.
:add: Adds a specific time amount to a date/time variable. Should be able to say easily add "1 month" as well as "1 day" or "1 hour" etc.
:seq: Creates a regular sequence of days or times. This should be flexible enough to allow for example picking the 5th of every month, but also 1 hour intervals.
:now: Returns current date/time.
:format: Turns a date/time variable into a string.

Mathematical/Statistical Functions
++++++++++++++++++++++++++++++++++
Functions that are related to statistical work, or pure mathematical functions.

Random Numbers
~~~~~~~~~~~~~~
Random number generators, either based on a distribution or on a sample variable. Largely following R's example here.

:sample: Randomly draw from a variable, optionally with repetition or with probability weights.
:rbeta: Beta
:rbinom: Binomial
:rcauchy: Cauchy
:rchisq: Chi-squared
:rexp: Exponential
:rf: F
:rgamma: Gamma
:rgeom: Geometric
:rhyper: Hypergeometric
:rlnorm: Log-normal
:rmultinom: Multinomial
:rnbinom: Negative binomial
:rnorm: Normal
:rpois: Poisson
:rt: t
:runif: Uniform
:rweibull: Weibull

Density Functions
~~~~~~~~~~~~~~~~~
:dbeta: Beta
:dbinom: Binomial
:dcauchy: Cauchy
:dchisq: Chi-squared
:dexp: Exponential
:df: F
:dgamma: Gamma
:dgeom: Geometric
:dhyper: Hypergeometric
:dlnorm: Log-normal
:dmultinom: Multinomial
:dnbinom: Negative binomial
:dnorm: Normal
:dpois: Poisson
:dt: t
:dunif: Uniform
:dweibull: Weibull

CDFs
~~~~
:pbeta: Beta
:pbinom: Binomial
:pcauchy: Cauchy
:pchisq: Chi-squared
:pexp: Exponential
:pf: F
:pgamma: Gamma
:pgeom: Geometric
:phyper: Hypergeometric
:plnorm: Log-normal
:pmultinom: Multinomial
:pnbinom: Negative binomial
:pnorm: Normal
:ppois: Poisson
:pt: t
:punif: Uniform
:pweibull: Weibull

Quantile Functions
~~~~~~~~~~~~~~~~~~
:qbeta: Beta
:qbinom: Binomial
:qcauchy: Cauchy
:qchisq: Chi-squared
:qexp: Exponential
:qf: F
:qgamma: Gamma
:qgeom: Geometric
:qhyper: Hypergeometric
:qlnorm: Log-normal
:qmultinom: Multinomial
:qnbinom: Negative binomial
:qnorm: Normal
:qpois: Poisson
:qt: t
:qunif: Uniform
:qweibull: Weibull


Statistics Functions
~~~~~~~~~~~~~~~~~~~~
Most of these functions will return a single value from each variable.

:weighted_sum: Sum of values of a variable. Allows for weights, defaults to weight of 1 everywhere.
:count: Length of a variable
:mean: Mean of a variable
:median: Median
:quantile: General percentile computations
:q1: First Quartile
:q3: Third Quartile
:min: Minimum
:max: Maximum
:mode: Most frequent observation. Will return a variable of all modes if multiple exist
:var: Variance
:sd: Standard Deviation
:cor: Correlation between two variables
:scale: Performs a linear transformation y=a+bx on the variable. Returns the z-scores if no a,b parameters specified.

Mathematical functions
~~~~~~~~~~~~~~~~~~~~~~
Sine, Cosine etc

:sin: Sine
:cos: Cosine
:tan: Tangent
:cot: Cotangent
:asin: Arcsine
:acos: Arccosine
:atan: Arctangent
:acot: Arccotangent
:exp: Exponential
:log: Logarithms

Exporting Functions
+++++++++++++++++++
Used for converting objects into more "shareable" formats, say a graph object into a pdf or jpeg file.

Print Functions
+++++++++++++++
Those are probably the ``summary`` functions mentioned earlier. Probably no need for this section unless I missed a function.

Utility Functions
+++++++++++++++++
Any utility functions that don't fit into any of the above

:parse: Takes a string expression and parses it into a JSON object. This function would be helpful in for instance turning the string ``"x <- foo + bar "`` into an appropriate JSON object expressing that the variable x is the "add" of the variables foo and bar.
:settings: Used to update the various types of settings.

