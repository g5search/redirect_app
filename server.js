const express = require('express')
const app = express()
const port = 3000
var models = require("./app/models");

// respond to any GET request 
app.get('*', redirectApp)


//Sync Database
models.sequelize.sync().then(function () {
    console.log('Nice! Database looks fine')

}).catch(function (err) {
    console.log(err, "Something went wrong with the Database Update!")
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function redirectApp(req, res) {
    var path = req.path
    var domain = req.headers.host
    var protocol = req.protocol
    console.log('vhost for', req.headers.host);
    // query the database for the url and its destination
    var redirect = await getRedirect(protocol, domain, path) 
    res.redirect(redirect)
    
  }

async function getRedirect(protocol, domain, path) {
// look for domain and path 

// if the domain is found but there is no path just upgrade the protocol to https
}