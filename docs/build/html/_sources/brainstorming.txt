PanthR Overview
===============

PanthR is a free web-based tool for statistics. It utilizes HTML5 and Javascript to create a rich environment and perform most statistical computations in the client itself, while at the same time linking to an R backend for more heavy duty tasks.

PanthR consists of 3 logical components:

- A :doc:`Client` written in Javascript. This client utilizes web workers to manage dataset computations. It manages datasets, graphs and other reports. It can work "offline", or by linking to a web server.
- A :doc:`Server` that locally connects to a local R server. The server receives client requests, creates a separate "id" for each client, delegates tasks to the R server, and sends results back to the client. Multiple organizations can run a server, providing size limits for how many users they can serve. The main page of the PanthR project should keep a list of all those "mirrors", allowing users to connect to a mirror closer to them.
- An established :doc:`API` for the communication between client and server. This interface should contain a rich enough syntax to allow the description of any typical task related to a dataset. It should probably contain a versioning system, allowing the possibility of updating the interface to offer more functionality. A client/server could then decide what level of this interface to support.
- A central location, :doc:`PanthR-org`, to act effectively as a distribution center. At this stage of the project, we ill have only one server and it will act as the distribution center as well.

Here's a rough picture of the connections.

.. image:: https://docs.google.com/drawings/d/17r-9nYO2rvgvkjlTy9jkZOWDJKfFrZVpADurVDZ95-s/pub?w=480&h=360


Random Thoughts
---------------


