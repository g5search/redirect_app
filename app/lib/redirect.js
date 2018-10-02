var express = require('express')
var app = express()
var models = require('../models')
var helmet = require('helmet')
module.exports = app
// disable for security 
app.use(helmet())

// repond to all GET requests
app.get('*', redirect)

async function redirect(req, res) {
    var path = req.path
    var host = req.hostname
    var protocol = req.protocol
    // query the database for the url and its destination
    var redirect = await getRedirect(protocol, host, path)
    if ('destination' in redirect) {
        // check for redirect loop
        if (redirect.destination !== protocol + host + path) {
            res.redirect(301,redirect.destination)
        } else {
            res.send('Domain is incorrectly pointed')
        }
    } else {
        // send error
        res.send(redirect.error)
    }
}

async function getRedirect(protocol, host, path) {
    var redirect = await findRedirect(host, path)
    if (redirect.length === 1) {
        return formatRedirect(redirect[0])
    } else if (redirect.length > 1) {
        // the database is not right there should never be more than one of each domain in the domain table
        return { error: 'multiple domains have been found' }
    } else {
        // look for all wildcard redirects for this domain and find the first one that matches
        let wildcards = await findWildcards(host)
        if (wildcards !== null) {
            return wildcards
        } else {
            return forward(host)
        }
    }
}
function forward(host) {
    // check root domain is the same as the host
    var rootdomain = host.match(/[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/)
    // forward to http:// incase a site went live without an SSL attached
    newURL = 'http://www.' + host + path
    if (rootdomain[0] === host) {
        // add WWW and forward
        return { destination: newURL }
    } else {
        // return error because this is a subdomain and we will not handle forwarding for it
        return { error: 'subdomain is not pointed correctly' }
    }
}
function formatRedirect(domain) {
    if (domain.redirects.length > 1) {
        // there is more than one redirect for the domain and path this should never happen unless the DB is manually edited
        return { error: 'more than one redirect for this domain and path' }
    } else if (domain.redirects.length === 1) {
        var redirect = domain.redirects[0]
        // there is only one redirect for this domain and path
        let destination = redirect.destination
        if (redirect.secure_destination === true) {
            destination = 'https://' + destination
        } else {
            destination = 'http://' + destination
        }
        return { destination }
    } else {
        // there is no redirect for this - this code is probably unreachable
        return { error: 'There is no redirect for this domain' }
    }
}
function findWildcards(host) {
    return models.domain.findAll({
        where: {
            domain: host
        },
        include: [
            {
                model: models.redirect,
                where: {
                    wildcard: true
                }
            }
        ],
        order: [['updatedAt', 'DESC']]
    }).then(wildcards => {
        if (wildcards.length > 0) {
            // itterate through the wildcard redirects looking for one with a partial string match with the path
            for (i = 0; i < wildcards[0].redirects.length; i++) {
                let redirect_path = wildcards[0].redirects[i].path
                if (path.indexOf(redirect_path) >= 0) {
                    return formatRedirect({
                        domain: wildcards[0].domain,
                        redirects: [
                            wildcards[0].redirects[i]
                        ]
                    })
                }
            }
            return null
        }
    })
}

function findRedirect(host, path) {
    return models.domain.findAll({
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
}