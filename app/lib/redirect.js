var express = require('express')
var app = express()
var models = require('../models')
module.exports = app

app.get('*', redirect)

async function redirect(req, res) {
    var path = req.path
    var host = req.headers.host
    var protocol = req.protocol
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
    var currentURL = protocol + '://' + host + path
    var newURL = 'https://' + host + path
    console.log()
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
    if (domain.length === 1) {
        return await formatRedirect(domain[0])
    } else if (domain.length > 1) {
        // we have something strange going on
        return { error: 'multiple domains have been found' }
    } else {
        // look for all wildcard redirects for this domain and find the first one that matches
        console.log('looking for wildcards')
        let wildcards = await models.domain.findAll({
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
            ]
        })
        console.log(wildcards.length)
        if (wildcards.length > 0 ) {
            console.log('wildcards found')
            // itterate through the wildcard redirects looking for one with a partial string match with the path
            for (i = 0; i < wildcards[0].redirects.length; i++) {
                let redirect_path = wildcards[0].redirects[i].path
                if (path.indexOf(redirect_path) >= 0) {
                    newURL = 'https://' + wildcards[0].redirects[i].destination
                    break
                }
            }
        } 
        console.log(currentURL)
        console.log(newURL)

        if (currentURL === newURL) {
            return { error: 'this site is not configured correctly - causing a redirect loop' }
        } else {
            return { destination: newURL }
        }
    }
}

async function formatRedirect(domain) {
    if (domain.redirects.length > 1) {
        // there is more than one redirect for the domain and path
        return { error: 'more than one redirect for this host and path' }
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
        return { error: 'There is no redirect for this domain' }
    }
}
