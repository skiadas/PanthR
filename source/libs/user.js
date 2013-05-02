var User = function (obj) {
   for (i in obj) {
      if (obj.hasOwnProperty(i)) {
         this[i] = obj[i];
      }
   }
}

User.prototype = {
   print: function () {
      return this.fname + ' ' + this.lname
   }

};

var a = new User({
   email: 'a1@a.com',
   fname: 'john',
   lname: 'doe'
});
console.log(a instanceof User);
console.log(a.print());

module.exports = User;
