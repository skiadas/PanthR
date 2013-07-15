define(function() {
   return function(options) {
       // Options ignored for now
       return {
           facets: {
               events: {
                   ready: function(resolver, proxy, wire) {
                       console.log("In events: ", resolver, proxy, wire);
                   }
               }
           }
       }
   }
});