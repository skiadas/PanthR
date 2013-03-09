Language API
============

Data communication takes place in JSON format. Each JSON object needs to contain the following keys:

    :id:
        The established id/hash for the client.
    :objects:
        An array of one more more objects, each representing an "object". The various available object listed in the subsections.
        We need to arrange things so that addons can create new "objects". Ideally this should be done in two levels, in Javascript as well as R.

Each object has a specific list of expected keys. Any other keys will be ignored.  All objects are represented in the API as a JSON object, with a ``type`` key holding the objects's type.

Each object typically includes at least the following keys:

:hash:
    A number used to identify an object within its workspace. Objects may change name but should retain their hash. This could simply start with 1 for the first created object in the workspace, and increase from there. Numbers corresponding to deleted objects are not recovered.
:type:
    The type of the object, e.g. variable, dataset, graph etc.
:name:
    The object's short internal name, used to refer to the object from other objects.
:label:
    An optional, longer, more human-readable, name.
:description:
    This could be a few lines accompanying the object. Typically not shown, but a user could use this to explain something about this object (e.g. where the data came from etc).

For the sake of brevity, and since they would appear in each object, these keys will be omitted from the object descriptions below.

Objects fit into the following broad types:

.. toctree::

    Structures
    Commands


