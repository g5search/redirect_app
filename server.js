const express = require('express')
const app = express()
const port = 3000
var models = require("./app/models");
require('dotenv').config()


var glx = require('greenlock-express').create({

    version: 'draft-11'                                       // Let's Encrypt v2 is ACME draft 11

    , server: 'https://acme-v02.api.letsencrypt.org/directory'  // If at first you don't succeed, stop and switch to staging
    // https://acme-staging-v02.api.letsencrypt.org/directory

    , configDir: '~/.config/acme/'                              // You MUST have access to write to directory where certs
    // are saved. ex: /home/foouser/.config/acme

    , approveDomains: myApproveDomains                          // Greenlock's wraps around tls.SNICallback. Check the
    // domain name here and reject invalid ones

    , app: redirectApp                                           // Any node-style http app (i.e. express, koa, hapi, rill)

    /* CHANGE TO A VALID EMAIL */
    , email: process.env.EMAIL                                   // Email for Let's Encrypt account and Greenlock Security
    , agreeTos: true                                            // Accept Let's Encrypt ToS
    , communityMember: false                                     // Join Greenlock to get important updates, no spam

    , debug: true

});

var server = glx.listen(80, 443);
server.on('listening', function () {
    console.info(server.type + " listening on", server.address());
});

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
function myApproveDomains(opts, certs, cb) {

    // In this example the filesystem is our "database".
    // We check in /srv/www/ for opts.domain (i.e. "example.com") and only proceed if it exists.
    console.log('opts.domain');
    console.log('opts.domain');
    console.log('opts.domain');
    console.log(opts.domain);
    console.log('opts.domain');
    console.log('opts.domain');

    // check that the domain is in the database
    let domain  = await models.domain.findAll({
        where: {
            domain: opts.domain
        }
    })

    if (domain.length < 1 ) {
        
    }

    // Check that the hosting domain exists on the file system.
    var hostdir = path.join(srv, opts.domain);
    fs.readdir(hostdir, function (err, nodes) {
        var e;
        if (err || !nodes) {
            e = new Error("rejecting '" + opts.domains[0] + "' because '" + hostdir + "' could not be read");
            console.error(e);
            console.error(err);
            cb(e);
            return;
        }

        // You could put a variety of configuration details alongside the vhost folder
        // For example, /srv/www/example.com.json could describe the following:

        // If you have multiple domains grouped together, you can list them on the same certificate
        // opts.domains = [ 'example.com', 'www.example.com', 'api.example.com', 'sso.example.com' ]

        // You can also change other options on-the-fly
        // (approveDomains is called after the in-memory certificates cache is checked, but before any ACME requests)

        // opts.email = "jon@example.com"
        // opts.agreeTos = true;
        // opts.challengeType = 'http-01';
        // opts.challenge = require('le-challenge-fs').create({});
        cb(null, { options: opts, certs: certs });
    });

}

// [SECURITY]
// Since v2.4.0+ Greenlock Express will proactively protect against
// SQL injection and timing attacks by rejecting invalid domain names
// in Host headers.
// It will also make them lowercase and protect against "domain fronting".
// However, it's up to you to make sure you actually have a domain to serve :)

//Sync Database
models.sequelize.sync().then(function () {
    console.log('Nice! Database looks fine')

}).catch(function (err) {
    console.log(err, "Something went wrong with the Database Update!")
});

app.listen(port, () => console.log(`redirect app listening on port ${port}!`))

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
    if (domain.length === 1) {
        return await formatRedirect(domain[0])
    } else if (domain.length > 1) {
        // we have something strange going on
        return { error: 'multiple domains have been found' }
    } else {
        // check if there is a domain in the database if it is upgrade the request to https and redirect to the www
        let domainCount = await getDomain(host)
        if (domainCount > 0) {
            return { destination: 'https://' + host + path }
        } else {
            return { error: 'There is no redirect for this domain' }
        }
    }
}
async function getDomain(domain) {
    return models.domain.count({
        where: {
            domain: domain
        }
    })
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