Files related to server operations.

db.js
  users db object:
  -db.init(dbobject)
  -db.createUser(userObject)
     +if exist update 
     +else creates new
   
  -db.deleteUser(userObject)
  -db.findUser(id) --id is email--

user.js
  -create({id: 'email', name: 'name', password: 'password'})
  -delete()
  -addFriend(id)
  -removeFriend
  