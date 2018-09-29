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
    var host = req.headers.host
    var protocol = req.protocol
    console.log('vhost for', req.headers.host);
    // query the database for the url and its destination
    var redirect = await getRedirect(protocol, host, path)
    if ('destination' in redirect) {
        res.redirect(redirect.destination)
    } else {
        // send error
        res.send(redirect.error)
    }
}

async function getRedirect(protocol, host, path) {
    // look for domain and path 
    var domain = await models.domain.findAll({
        where: {
            domain: host
        },
        include: [
            {
                model: models.redirect,
                where: {
                    path: path
                }
            }
        ]
    })
    if (domain.length > 1) {
        return await formatRedirect(domain[0])
    } else {
        return { error: 'There is no redirect for this domain'}
    }
    // if the domain is found but there is no path just upgrade the protocol to https and redirect to www
}

async function formatRedirect (domain) {
    if (domain.redirects.length > 1) {
        // there is more than one redirect for the domain and path
        return { error: 'more than one redirect for this host and path'}
    } else if (domain.redirects.length === 1) {
        var redirect = domain.redirects[0]
        // there is only one redirect for this domain and path
        let destination = redirect.destination
        let protocol = null
        if (redirect.secure_destination === true) {
            destination = 'https://' + destination
        } else {
            destination = 'http://' + destination
        }
        return { destination }
    } else {
        // there is no redirect for this 
        return { error: 'There is no redirect for this domain'}
    }
}