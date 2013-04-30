var User = function (obj)
{
	for(i in obj)
	  {
	    if(obj.hasOwnProperty(i))
	      {
	      this[i] = obj[i];
	      }
	   }
}	 

User.prototype = {
  print: function() 
    { return this.fname + ' ' + this.lname}
    
};

var a = new User({_id:'beitzr14',fname:'john', lname:'doe'});
console.log(a instanceof User);
console.log(a.print()); 

exports = User;
