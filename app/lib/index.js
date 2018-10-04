var express = require('express')
var app = express()
var helmet = require('helmet')
module.exports = app
// disable for security 
app.use(helmet())

var redirects = require('./redirect')

// repond to all GET requests
app.get('*', redirect)

async function redirect(req, res) {
    var path = req.path
    var host = req.hostname
    var protocol = req.protocol
    // query the database for the url and its destination
    console.log('getting redirects')
    var redirect = await redirects.get(protocol, host, path)
    if ('destination' in redirect) {
        // check for redirect loop
        if (redirect.destination !== protocol + host + path) {
            res.redirect(301,redirect.destination)
        } else {
            res.send( host + ' is incorrectly configured creating a redirect loop')
        }
    } else {
        // send error
        res.send(redirect.error)
    }
}