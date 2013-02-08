PanthR Overview
===============

PanthR is a free web-based tool for statistics. It utilizes HTML5 and Javascript to create a rich environment and perform most statistical computations, at the same time linking to an R backend for more heavy duty tasks.

PanthR consists of 3 logical components:

- A `Web Client`_ written in Javascript. This client utilizes Webworkers threads to manage dataset computations. It manages datasets, graphs and other reports. It can work "offline", or by linking to a server.
- A `Web Server`_ that locally connects to a local R server. The server receives client requests, creates a separate "id" for each client, delegates tasks to the R server, and sends results back to the client. Multiple organizations can run private or public servers, providing size limits for how many clients they can serve. The main page of the PanthR project should keep a list of all those "public mirrors", allowing clients to choose which mirror to try to connect to. Possibly implemented in Node.js.
- An established `API`_ for the communication between client and server. This interface should contain a rich enough syntax to allow the description of any typical task related to a dataset. It should probably contain a versioning system, allowing the possibility of updating the interface to offer more functionality. A client/server could then decide what level of this interface to support.

Web Client
----------

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

Web Server
----------

The Web Server maintains a permanent link to a local R process (likely RServe ?). It contains the following:

- A configuration file that administrators can use to detail information about the server. See the ``/status`` request below for required fields. The server process will look for configuration files of names ``panthr_config.ext`` where ext is in order: ``json``, ``yaml``, ``xml``. The first configuration found will be used.
- An RServe process, that is started from the server process and links to it. The server process is responsible for tearing down the RServe process.
- The server process. The server process needs to do the following:
    - Maintain a list of current clients and corresponding ids. Upon establishing a connection, each client is assigned a randomly generated 16 digit hexadecimal id, which is used to identify the client in future communications. It is also used as a 'namespace' identifier to separate data on the R server corresponding to different clients.
        - Would be great to enable *shared* data sets, so changes by one client are seen by others.
    - The list maintains information on the time that the client established a connection, as well as the time when the client last communicated with the server. Based on this and configuration settings, the server decides when to disconnect a client.
    - Non-public servers can also link to a database process where they can store information on their clients, save certain datasets, etc.
    - Public servers purge all client related information upon disconnecting with a client.
    - Servers pass most ``/data`` requests to the R server. The API for these requests is described further in the `API`_ section.

In theory, servers could be written that link to other software rather than R. As long as they support the `API`_.

Requests Served
~~~~~~~~~~~~~~~

``/status``
    A GET request, returns information about the server, containing the following fields (This information should probably be saved in a configuration file).

    :name:
        How the server wants to be known to the world.
    :owner:
        The person or organization managing the server. Optional.
    :location:
        Physical location of the server (city/state?).
    :server_version:
        Version of the server program. This will follows a standard digit.digit format.
    :api_version:
        The highest version of the API that this server supports. To account for future expansions.
    :public:
        Whether the server is meant to be available to anyone who might want to use it. Public servers to not preserve any client data once a timeout occurs, or once the maximum time is exceeded.
    :timeout:
        Number of seconds of inactivity that would cause a server to disconnect from a client. Should default to two hours (7200).
    :max_time:
        Should default to one day (86400).
    :auth:
        Protocol required for authentication. Will need to identify meaningful values. A value of 'none' should mean that no authentication is necessary. 'none' should be the default value for public servers.
    :max_clients:
        The number of clients that can be serviced at any given time. An integer.
    :no_clients:
        Current number of active clients.


``/ping``
    A GET request from a client, to establish a connection to the server. The request may contain:

    :id:
        An existing id for this client, likely obtained during a previous request. IDs are 16-digit hexadecimals. Lack of this field will establish a new connection.
    
    - A successful connection should return a 200 status code, and the message text should contain the 16 digit ID key to be used by the client in any future communication.
    - If the server cannot accept any new clients at this time, it should return a 503 status code.
    - A failed authentication would return a 401 status code.

``/data``
    Typically a POST request from a client, requesting actual some work from the server. Detailed in the `API`_ section. These requests form the majority of client/server communication. The client would use this request to inform the server of a change in the data set, or to request some computations from the server. Clients should try to chain requests together, to minimize the communication overhead.
    If a disconnected client attempts a ``/data`` request, a 403 status code should be returned.


API
---

We will be establishing a "language" to be used for communication between the client and its various servers, see :doc:`API` for details.
