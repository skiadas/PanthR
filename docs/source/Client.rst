Web Client
==========

The web client provides an interface to users for performing statistics. It can run on its own with limited functionality, or connect to a web server to utilize R's computing power. The main components of the web client would be as follows:

- The main UI. It should contain:
    Login Menu
        Allows connecting to a background server, with optional login credentials, or offline work. Should sit in the top right of the screen.
    Data Editor View
        Typical editable spreadsheet view of the data. Should offer basic sorting (and optionally filtering/searching) functionality. This should be one of several main views the user can switch to. The user should be able to hide/reorder variables.
    Summary View
        Provides brief summary of the data set, e.g. descriptives of each variable. This should be one of several main views the user can switch to. Probably use the List Inlay pattern.
    Active Element Info
        Shows information on the currently selected column and element. E.g. basic variable summaries, z-scores for that value within its column, basic graph, etc. This should probably be optional.
    Application Menu
        Typical menu where users can select commands to execute. Consider using Fat Menus. Would probably contain the following menus:
        - File: New, Open, Save, Import, Export
        - Data: New Variable, New Filter
        - Reports: Graph, Table, Test
        - Settings: Graph, Table, Test, Save, Load
    Filters List
        Contains information about all filters on the data. Includes both active and non/active filters. Users can activate/deactivate filters, create new filters, remove existing filters, rename filters. Filters would be expressions that select a subset of rows. Probably implemented by a List Inlay pattern.
    Reports List
        List Inlay of the selected reports for this dataset. Each report can be clicked for a bigger version, saved/exported. Ideally should be able to set some custom settings on it. Reports can be Graphs, Tables, Tests.
