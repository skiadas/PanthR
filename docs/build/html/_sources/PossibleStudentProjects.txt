Thoughts on components that we could have students program:

Dataset Importer/Exporter
-------------------------

This would be a Javascript library that would manage reading and writing datasets in various formats, converting to and from PanthR's JSON format. 

It should be able to read and write in as many of the following formats:

    - Comma-Separated, Tab-separated
    - Excel (both old if possible, and new)
    - SPSS
    - HTML table (possibly even read out from an entire HTML page)
    - R object (rda)
    - Fixed Column format
    - General XML structures?

Importing
+++++++++

When importing:

- The library should accept information about the format, but it should also be in a position to "sniff out" as much as possible about the file without any information.
- The library should return not just the dataset in whatever form it deciphered it, but also information about what choices it had to make, possible problems it encountered etc.
- It should also be able to accept back the object it returned, with any possible modifications in the settings the user/ui did, and try to parse it again. For example, the library has just tried to read this file, and found a column that looked like dates in a yyyy/mm/dd format. It would return that information, along with formats for other columns, as part of its reply. The user/ui might then tell right back to the library that it was in fact a yyyy/dd/mm format. The library would then return the correct format.
- The library should be able to handle numeric data even if it is in a currency form (with a currency symbol up front), it should be able to handle using commas to separate thousands, or using the european format where comma is used for the decimal spot and dots for the thousands. This holds for exporting as well.
- It should be able to accept both strings and io-streams as inputs. Similarly it should be able to output as either string or io-stream.

Exporting
+++++++++

Users should be able to set row names, column names, column formats, etc.


Node.js -- RServe interface
---------------------------

RServe is designed to provide access to R through TCP/IP. It handles different clients, and provides them with their own namespace.

We need to communicate with this RServe process from Node.js. This node.js package should be able to:

- Start up and shut down RServe
- Monitor RServe's performance to the extent possible
- Pose itself to RServe as distinct clients to manage different namespaces for each user. Depending on how RServe is set up at the moment, this may require a rewrite to parts of RServe.
- It should manage queues of requests coming in and out. Messages need to be processed in the same order they arrive. Given Node.js's asynchronous nature, this may require some careful thought.

Node.js user account management
-------------------------------

- Each user should be able to create an account by simply providing an email and choosing a password. Account verification would be done through that email.
- User preferences and settings should be stored on the server, along with the current workspace session information.
- Users should be able to save "workspaces" on the server.
- Optionally, users should be able to "link" their account with a Dropbox or similar account.

Node.js main Express server application
---------------------------------------

- Maintains basic info about the server, and serves it on status requests.
- When a user asks for a connection, the client interface page is sent via HTTP, and a Web Sockets connection is established.
- Language API messages are sent across this Web Sockets connection. The server maintains a queue for messages coming from the client and then passed to the RServer, and a queue of messages coming from the RServer and passed to the client.
- The server needs to be able to maintain the state the client was in when the client breaks a connection.

Graph and Graph Editor objects
------------------------------
The Graph object needs to do a couple of things:

- It learns what it needs to do from a *Graph Output Object* or a *Graph Results Object*.
- It handles a Canvas HTML element on which it can draw itself.
- It should handle the various different plot types, as well as the various graph components one could add to a graph.
- Users should be able to interact with elements of the graph and get information about where in the data those values come from.

A supplementary, but possibly simpler, component to this is an R library, that would accept and handle a Graph Output Object, and would be able to return this object in various image formats. This would in particular require translating the various graphing parameters to things R would understand.

The Graph Editor Object needs to provide the user with an intuitive way to build a graph together.

- It has a way to set graph type, x and y variables, filters, grouping variables, other parameters
- Includes a preview of the graph.
- It should have a toolbar providing graph components to add, as well as edit windows for each of those components.
- A user should be able to edit existing components by either picking them off a list or by clicking on them in the preview.

Look in the :doc:`Structures` page for details on what the graph and graph component settings would be.

