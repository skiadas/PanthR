Web Server
==========

The Web Server maintains a permanent link to a local R process (likely RServe ?). The following components need to be set in place on the server:

- A configuration file ``panthr_config.json`` that administrators can use to detail information about the server. See the ``/status`` request below for required fields.
- An RServe process, that is started from the server process and listens to requests from it. The server process is responsible for tearing down the RServe process.
- The server process, implemented in `Node.js <http://nodejs.org/>`_. The server process needs to do the following:
    - It maintains a database of user credentials. A user can register by simply providing a valid email address as their username, and set a password. (Possible persistent data store solutions: MongoDB, Redis, some other database). Account verification should take place via that email address.
    - Users need to log in before they can use the server's resources. They can still download the client, but in order to connect to the R backend they will need to set up an account and log in.
    - Users should have the option to "keep themselves logged in" for a period of time. In that case, their login information is stored in a cookie, and the user is automatically logged in when they access the web server.
    - User can also save their preferences how various settings (color palettes, graph symbols, table defaults, menu defaults etc). These preferences are saved the moment they are set. A user should be able to have multiple possible preference sets (e.g. one setting for printing, or separate setting for classwork vs research etc). See :doc:`Settings`.
    - The server uses a persistent data store to store the user's work. It can save "Workspaces", namely a collection of objects/reports/commands that the user has created. The user can have multiple workspaces for the various projects.
    - There is always a "Current Workspace" that the user is working on. Upon a disconnect, this workspace is preserved to be used the next time the user logs in. (Similar to a browser's last session).
    - The server logs information about the user connection, when it is established, when messages are sent around and what types they are etc.
    - Based on its configuration settings, the server may decide to disconnect a client after a period of inactivity.
    - Public servers purge all client related information upon disconnecting with a client.
    - Servers pass most data requests to the R server. The API for these requests is described further in the :doc:`API` section. Messages are communicated in JSON.

In theory, servers could be written that link to software other than R. As long as they support the :doc:`API`. Our commands and syntax however are largely influenced by R.

Configuration
~~~~~~~~~~~~~

``panth_config.json`` is a file that should reside at the root of the server application. It is a JSON file with exactly one object, whose properties are parameters to set, which determine the operation of the server. Most of these properties are public and are returned by the server upon a ``/status`` request. See that section for those. This section describes some private information.

:user_validation:
    This is the filepath to a script file that performs the validation of whether a user with a specific email account is allowed to create an account. It would be expected to receive as input the user's email account, and return 1 if the user is allowed to create the account and 0 otherwise. Organizations that want to host their own servers can thus restrict access to users with email accounts in the organization, or perhaps even more restrictive. We should provide a sample script using hanover.edu, that people could then alter to fit their needs.

:allow_full_r:
    This would be a boolean variable indicating whether the server allows users access to arbitrary R commands. This should default to false, and come with very serious warnings about the dangers of altering it. On a first incarnation of the project we should not allow this at all.

:extensions:
    An dictionary, with keys specifying the names of available extensions, and the values specifying filepaths to files implementing those extensions. We will need to specify those file formats if we want to implement extensions this way, leave as placeholder for now. the ``/status`` request should return an array keyed by the extension key, containing the list of names of those extensions, without the filepath information (or possibly pass them as is?).

:port:
    Which port number the server should listen to. It would default to 80.

Requests Served
~~~~~~~~~~~~~~~
The web server should listen for HTTP requests, preferably on port 80, though this could potentially be customizable. It is implemented using the `Express Framework <http://expressjs.com/>`_ in `Node.js <http://nodejs.org/>`_.

It should serve the following requests:

``/status``
    A GET request, returns information about the server, containing the following fields (This information would mostly come from a configuration file).

    :name:
        How the server wants to be known to the world.
    :owner:
        The person or organization managing the server. Optional.
    :location:
        Physical location of the server (city/state?). Optional.
    :server_version:
        Version of the server program. This will follow a standard digit.digit format. Will likely remain at 1.0 for quite a while.
    :api_version:
        The highest version of the API that this server supports. To account for future expansions. Will likely remain at 1.0 for quite a while.
    :timeout:
        Number of seconds of inactivity that would cause a server to disconnect from a client. Should default to one hour (3600).
    :max_time:
        The maximum time that a server would allow a client to connect. Should default to one day (86400). A value of `null` or missing field would indicate that a client could connect indefinitely.
    :max_users:
        The number of clients that can be serviced at any given time. An integer. A value of `null` or missing key would indicate no limits.
    :no_users:
        Current number of active clients.
    :max_data:
        Data sets will be accepted only if the product of their dimensions (subject number times variable number) does not exceed this number. Value of `null` or missing indicates no limits.

``/``
    A GET request that just sends the client web page `index.html`, with all the client javascript code necessary.
    
``/login``
    A GET request from a client, to establish a connection to the server. Established when the user choses to "log in". The request will identify users with their credentials. We'll need to find the best way to do that.
    
    - A successful connection should return a 200 status code, and establishes a websockets communication with the client.
    - If the server cannot accept any new clients at this time, it should return a 503 status code.
    - A failed authentication would return a 401 status code.

``websocket messaging``
    Data communication between the server and the client is done via websockets, using Node.js's `Socket.IO <http://socket.io/>`_ library. The specific objects that are exchanged that way are detailed in the :doc:`API` section. These messages form the majority of client/server communication. The client would use such a message to inform the server of a change in the data set, or to request some computations from the server.

The following main messages will be used, beyond the standard messages for connection and disconnection:
    
    :data:
        Contains a list of "data". The format of the data is what is specified in the :doc:`API` section.
    :ok:
        Used to acknowledge receipt of a data message.
    :ping:
        Used to test the connection. It can also be used by the server to communicate system information, for instance if the R process is overtaxed.

Sample Interaction
------------------
A possible example interaction could go as follows:

#. The user loads the client and connects. Client and server exchange ``connection`` messages.
#. The user asks the client to load a new dataset. The client passes this dataset to the server via a :token:`data` message. The server replies with an :token:`ok` message. It also passes that dataset to RServe.
#. At the same time, the client, anticipating the user's needs, prepares an object for computing some numerical summaries, and another object to ask for a graph. Those stay in a queue in the client.
#. When the client receives the :token:`ok` from the server on its first :token:`data` message, it sends a :token:`data` message with the numerical summaries request. The server sends this request to RServe for processing, and in the meantime replies with an :token:`ok` message to the client, acknowledging receipt of the message.
#. The client now sends a :token:`data` message to the server, with the graph object request. The server passes this over to RServe and replies with an :token:`ok` message to the client.
#. In the meantime, RServe has finished the numerical summaries computations, and sends them to the server. The server then sends this summaries object to the client in a :token:`data` message. It has also heard from RServe on the graph, and adds that to a queue.
#. The client receives the :token:`data` message with the numerical summaries, replies with an :token:`ok` message, and posts those summaries in the interface for the user to see (or keeps them around if the user hasn't asked for them yet).
#. When the server receives the :token:`ok` message from the client, it finds the graph object in its queue and sends that in a :token:`data` message to the client. The client replies with an :token:`ok`.
#. Finding his queue empty, the server sends nothing back.
#. Every so often (20-30 seconds?), the client sends a :token:`ping` message to the server. The server replies with a :token:`ping` message, and at the same time contacts RServe on behalf of the user with a similar ping message. It then sends a second :token:`ping` to the client when it hears back from RServe. The client uses those messages to estimate latency and update the login UI with that information.


Server Components
~~~~~~~~~~~~~~~~~

These are the server components that need implementation:

:program:`Rserve-client.js`
    A Javascript Client for RServe. This would be a Node.js module. It should have the ability to manage different users contacting RServe.

:program:`panthr2r`
    A conversion library. It should convert PanthR Objects to R Objects, and vice versa. This would be another Node.js Javascript module.

:program:`PanthR.r`
    An R library to implement concrete functions for the "high level" structures in the PanthR API.

:program:`PanthR-server`
    The main Node.js application, built using Express. It authenticates users, connects to a persistent data store (MongoDB/Redis) to keep user settings and workspace info. Uses Socket.IO to exchange data messages with the clients. Uses Rserve-client.js to ask RServe for information.
