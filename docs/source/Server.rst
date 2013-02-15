Web Server
==========

The Web Server maintains a permanent link to a local R process (likely RServe ?). The following components need to be set in place on the server:

- A configuration file ``panthr_config.json`` that administrators can use to detail information about the server. See the ``/status`` request below for required fields.
- An RServe process, that is started from the server process and listens to requests from it. The server process is responsible for tearing down the RServe process.
- The server process, implemented in `Node.js <http://nodejs.org/>`_. The server process needs to do the following:
    - Maintain a list of current clients and corresponding ids. Upon establishing a connection, each client is assigned a randomly generated unique id, which is used to identify the client in future communications (This might not be needed as the clients are in fact distinct objects on the server). It is also used as a 'namespace' identifier to separate data on the R server corresponding to different clients.
    - The list maintains information on the time that the client established a connection, as well as the time when the client last communicated with the server. Based on this and configuration settings, the server decides when to disconnect a client (A client that's not connected for say 4 hours shouldn't take up space).
    - Non-public servers can also link to a database process where they can store information on their clients, save certain datasets, etc. (This should probably be thought of as an afterthought. We should find other ways for users to save and share data and results).
    - Public servers purge all client related information upon disconnecting with a client.
    - Servers pass most ``/data`` requests to the R server. The API for these requests is described further in the :doc:`API` section. Messages are communicated in JSON.

In theory, servers could be written that link to software other than R. As long as they support the :doc:`API`.

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
        Whether the server is meant to be available to anyone who might want to use it. Public servers do not preserve any client data once a timeout occurs, or once the maximum time is exceeded.
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


``/connect``
    A GET request from a client, to establish a connection to the server. The request may contain:

    :id:
        An existing unique id for this client, likely obtained during a previous request. Lack of this field will establish a new connection.
    
    - A successful connection should return a 200 status code, and the message text should contain the 16 digit ID key to be used by the client in any future communication. At the same time, it establishes a websockets communication with the client.
    - If the server cannot accept any new clients at this time, it should return a 503 status code.
    - A failed authentication would return a 401 status code.

``websocket messaging``
    Data communication between the server and the client is done via websockets. Detailed in the :doc:`API` section. These messages form the majority of client/server communication. The client would use such a message to inform the server of a change in the data set, or to request some computations from the server. Clients should try to chain data messages together, to minimize on the communication overhead.
    
    TODO Need to specify the exact form for these messages.

