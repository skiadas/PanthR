Language API
============

Data communication takes place in JSON format. Each JSON object needs to contain the following keys:

    :id:
        The established id/hash for the client.
    :objects:
        An array of one more more objects, each representing an "object". The various available object listed below.
        We need to arrange things so that addons can create new "objects". Ideally this should be done in two levels, in Javascript as well as R.

Objects
~~~~~~~~
Each object has a specific list of expected keys. Any other keys will be ignored.  All objects are represented in the API as a JSON object, with the ``type`` key holding the objects's type. Objects fit into the following broad types:

.. toctree::

    Structures
    Commands


