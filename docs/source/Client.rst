Web Client
==========

The web client provides an interface to users for performing statistics. It can run on its own with limited functionality, or connect to a web server to utilize R's computing power. The main components of the web client would be as follows:

- The main UI. It should contain:
    :guilabel:`Login Menu`
        Allows connecting to a background server, or doing offline work. Should sit in a corner of the screen, possible hidden on some screen sizes, available as a small button. Should contain information about the connection's latency.
    :guilabel:`Main View`
        It consists of a tabbed view. Selecting the tabs, or interacting with items changes what you see.
        
        :guilabel:`Breadcrumbs`
            At the top of the Main window a breadcrumb view could allow navigation to different levels, starting at the top Workspace level.
            
            For example, when examining a specific variable, those breadcrumbs might show: "Workspace > Objects > MyDataset1 > MyVariable2". The main view would then turn into the Variable View to show information about the variable. If the user clicks on the "MyDataset1" breadcrumb, a thumbnail grid or outline view of all the set's variables would appear, or alternatively a summary sheet for the dataset. If he clicked the Objects, then a thumbnail grid view of all the top level objects would show up. If he clicked on Workspace, he might be presented with general information on the objects and reports/outputs that are part of this Workspace, and could dig further in by selecting the appropriate type.
            
            In sort, it's a way to move up the "Workspace -> Dataset -> Variable" hierarchy. An alternative interface would be to simply implement a "go up a level" button, but the breadcrumbs have the advantage of showing us where we are in the hierarchy.
            
        :guilabel:`Action menu`
            The bottom of the Main View could perhaps contain an Action menu, a list of buttons that would perform the actions required, and would perhaps change depending on the view. This should allow users to perform many of the operations without having to open the main menu.
            
            The following two are the "tabs" one can choose from. Each of those tab views would appear different depending on what kind of object it was showing. Some of the combinations might be redundant.
        :guilabel:`Edit View`
            This is a form that allows "editing" of the object.
            
            - For a dataset this would be a standard spreadsheet view of the data. Should offer basic sorting (and optionally filtering/searching) functionality, and any entry would be editable.
            - For a variable, this would offer on one side a long column view of the variable's values, and on the other parameters that could be set for the variable, e.g. the type of the variable, number of decimal points to show, dollar signs in front, date format etc. It would contain a table with the values and their frequencies, as well as value labels for them, and this would be editable. If space permits, in a corner, a small summary of the variable might be visible (mean/st.dev, a graph etc).
            - For an output/report, this would be the dialog for the output, allowing edits/additions etc.
            - For a workspace, this would allow the user to rename the workspace, export it, create a new one etc. It would provide lists of objects and outputs that are in the workspace, and the user could delete/add objects, combine objects, create a new workspace from a subset of the objects etc.
            - For filters, this would be essentially the edit window used to specify what the filter does.
        :guilabel:`Summary View`
            Provides summary of the object. "summary" might not be the correct word. Examples:
        
            - For a dataset, this would be either a list of the variables with minimal info about them, or a thumbnail grid of the variables with minimal info about them. User would be able to select variables and act on them to generate reports. It may also contain somewhere summary information about the dataset, like number of variables, number of rows, other peripheral info about the dataset.
            - For a variable, this could contain a small table of statistics, coupled with an interactive graph of the variable.
            - For an output/report, this would be the visual result for the report, graph, table whatnot. For tests, it maybe contain some diagnostic graphs.
            - One should be able to get a Summary View of all outputs/reports. This would be a thumbnail view or outline view, that would allow you to see all reports at once, select multiple reports for mass exporting etc.
            - For a workspace, this would provide a thumbnail view or outline view of the objects and reports in it. Very similar to the Edit View for workspaces.
            - One should also be able to get a Summary View of all Workspaces. They would use it to for instance switch to a new workspace, set a default workspace, delete a no-longer needed workspace, etc.
            - There could be a thumbnail/outline view of all filters.
            
            Perhaps instead of "Summary" view we could have "Outline" vs "Thumbnail" views as different tab options. Though those make less sense for outputs/reports.

    :guilabel:`Sidebar`
        The sidebar is a customizable view that the user may choose to hide or show, on which he/she can add "components". Each component is essentially duplicating a feature that could have been present in the main view. A user should be able to get their work done even in the absence of the sidebar.
        
        Here's a list of possible "components":
        
        - Objects list
        - Outputs list
        - Filters list
        - Summary (shows a summary of active element)
        - Graph (shows a graph of active element)
        - Smart preview
        
    :guilabel:`Application Menu`
        Typical menu where users can select commands to execute. Consider using Fat Menus. Could either be activated by one button, or provide the first level of menus as a list.
        
        Possible menus:
        
        - Workspace   (Perhaps should be merged with File)
            - Import
            - Export
            - New
        - File  (Used to load/save datasets or possibly individual variables)
            - Import
            - Export
            - New
        - Data
            - Add...  (New variables, new Filters)
            - Merge
            - Reshape
        - Report
            - Descriptive
            - Test
            - Graph
        - Settings
            - Interface
            - Descriptive
            - Test
            - Graph

