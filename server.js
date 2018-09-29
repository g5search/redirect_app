require('dotenv').config()

require('greenlock-express').create({

    // Let's Encrypt v2 is ACME draft 11
    version: 'draft-11'
  
  , server: 'https://acme-staging-v02.api.letsencrypt.org/directory'
    // Note: If at first you don't succeed, stop and switch to staging
    // https://acme-staging-v02.api.letsencrypt.org/directory
  
    // You MUST change this to a valid email address
  , email: process.env.EMAIL
  
    // You MUST NOT build clients that accept the ToS without asking the user
  , agreeTos: true
  
    // You MUST change these to valid domains
    // NOTE: all domains will validated and listed on the certificate
  , approveDomains: [ 'redirect.tylerhasenoehrl.com']
  
    // You MUST have access to write to directory where certs are saved
    // ex: /home/foouser/acme/etc
  , configDir: '~/.config/acme/'
  
  , app: require('express')().use('/', function (req, res) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('Hello, World!\n\n💚 🔒.js');
    })
  
    // Get notified of important updates and help me make greenlock better
  , communityMember: false
  
  //, debug: true
  
  }).listen(8080, 8081)