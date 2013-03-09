PanthR Overview
===============

PanthR is a free web-based tool for statistics. It utilizes HTML5 and Javascript to create a rich environment in which users can perform most standard statistical computations. The computations are done in the client itself when possible, while at the same time contacting an R server for more heavy duty tasks and more accurate answers.

While PanthR does not give you access to the full suite of tools that R provides, it is our hope that it will satisfy most requirements of ``casual statistics users``, and that it can be used efficiently for the teaching of college level statistics. We hope to expand it over time and would appreciate your contributions in that direction.

PanthR also stores your data and work on the server, and you can access it from any place where you have internet access, as well as share it with friends and colleagues.

PanthR consists of 3 logical components:

- A :doc:`Client` written in Javascript. This client utilizes web workers threads to manage dataset computations. It handles all the user interaction elements, and manages datasets, graphs and other report-type objects. It can work "offline", though storage of information would work a lot better when connected to a web server.
- A :doc:`Server` that locally connects to an R server backend. The server receives client requests, handles login information, delegates tasks to the R server, and sends results back to the client. Multiple organizations can run a server, providing limits for who can have access to their server. The main page of the PanthR project should keep a list of all those "mirrors", allowing users to connect to a mirror closer to them if one is available.
- An established :doc:`API` for the communication between client and server as well as the storage and exchange of information. This interface should contain a rich enough syntax to allow the description of any typical task related to a dataset. (It should probably contain a versioning system, allowing the possibility of updating the interface to offer more functionality. A client/server could then decide what level of this interface to support.)
- A central location, :doc:`PanthR-org`, to act effectively as a distribution center. At this stage of the project, we will have only one server and it will act as the distribution center as well.

Here's a rough picture of the connections.

.. image:: https://docs.google.com/drawings/d/17r-9nYO2rvgvkjlTy9jkZOWDJKfFrZVpADurVDZ95-s/pub?w=480&h=360

