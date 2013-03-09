Settings
========

Meant for a discussion on what should be customizable and how. This is very much brainstorming for now.

Add your thoughts, marking them with a (@username) at the end.

Graph Settings
~~~~~~~~~~~~~~

These should determine how graph parameters should be displayed.

Users should be able to define parameters at 3 levels:

- First level would be general settings. Those would work for all graphs.
- At a second level would be settings corresponding to different output formats. Those would be thought of as overwriting first level settings: If a value is not specified in the output format, the first level value is used. There would be four different formats:
    - "screen" for settings on how the graph would appear on screen.
    - "small" for settings on how the graph should appear on smaller screens (tablets).
    - "file" for settings on how the graph should be saved. For example the dimensions might be different. We might want to also include here default file format, and/or different dimensions for different file formats.
    - "print" for settings on how the graph should appear in a printout. These might be redundant, the "file" option might be good enough for that.
- At a third level, the direct functions that would result in a printing or the specific output objects could have specific settings, that would overwrite every other setting.

A list of possible parameters. We should consider some ways of organizing them.

- overall dimensions x, y for the graph
- margins on the 4 sides
- colors: A list of colors that would be used in that order wherever different colors are needed. We should allow people an easy way to provide standard scales. These would be used both as fill colors and when different line colors are needed.
- point-icons: A list of point icons to be used when multiple point types are needed.
- line-styles: A list of line styles to be used when multiple line styles are needed.
- line: Settings for how a line should appear. Sub-settings in it would be:
    - width: in pixels probably
    - style: "solid", "dashed", "dotted" etc
    - color: main color for lines
- point: Settings for how points should appear. Sub-settings would be:
    - size: in pixels
    - icons: some way to specify type of icon, square, triangle etc
    - color: main color for points
- text: Overall settings for the appearance of text. Subsettings could be:
    - size: Font size in pixels
    - family: Font family (Times New Roman etc). We can use a lot of web-fonts for the screen versions, we should figure out a way to only offer a reasonable set of choices there.
    - style: normal/italic/bold/bold italic
- bar: Basic settings to be used for the bars (histogram/bargraph etc)
    - color: To be used for the boundaries. If absent, line color is used.
    - fill: To be used for filling in.
    - width: To be used for the boundary width.
- background-color: to be used on the overall background of graphs.


Question: Should we bother with "patterns" for background? Or is it not relevant given most modern visualization and printing tools? My vote would be towards not allowing them. (@skiadas)

Table Settings
~~~~~~~~~~~~~~
These should affect how tables would appear.

Q: Perhaps these are too much and we should offer only a few customization options for tables. (@skiadas)

-text: Determines settings for table text. 
    - size: Font size in pixels
    - family: Font family (Times New Roman etc). We can use a lot of web-fonts for the screen versions, we should figure out a way to only offer a reasonable set of choices there.
    - style: normal/italic/bold/bold italic
    - color: Text color
    - header: Specifies text settings for the header
- border: Specifies border lines. Standard border subsettings.
    - cell: Specifies border lines separating inner cells.
    - header: Specifies border lines separating header cells from inner cells.
- background-color: Overall background color
    - header: Specifies background color for the headers.

UI Settings
~~~~~~~~~~~
They affect how the application's UI would show up. Some things to include:

- Whether the sidebar would be there or not, and what things it would contain.
- Whether menus would be simplified or not.
- A list of "plugins" to use (e.g. for specific disciplines).
- We might want to consider setting up global text settings, that would be inherited in both graphs and tables.