var jade = require('jade')
  , options = { pretty: true, locals: {}, filename: __dirname + '/index.html' }
  , fs = require('fs')
  , fn = jade.compile(
        fs.readFileSync(__dirname + '/views/index.jade', 'utf8'), 
        options
    )
fs.writeFile(__dirname + "/index.html", fn(options.locals), function(err) {
    if (err) {
        console.log("Error writing index.html")
    } else {
        console.log("Created index.html")
    }
})
