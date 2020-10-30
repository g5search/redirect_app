const express = require('express')
const app = express()
const redirects = require('./redirect')
const greenlock = require('../../greenlock')
// respond to all GET requests
app.get('*', ({ path, hostname, protocol }, res) => {
  redirects
    .get(hostname, path)
    .then(redirect => {
      if (!redirect.destination.match(new RegExp(`https?://${hostname}${path}/?`))) {
        // check for redirect loop
        res.redirect(301, redirect.destination)
      }
      else {
        res 
          .status(404)
          .send(
            `${hostname} is incorrectly configured creating a redirect loop`
          )
      }
    })
    .catch(err => {
      res.status(404).send(err.toString())
    })
}),
  app.post('/api/v1/redirects', express.json(), async (req, res) => {
    const domains = await greenlock.sites.remove({
      subject: "redirect3.tylerhasenoehrl.com",
      altnames: ["redirect3.tylerhasenoehrl.com"]
    });
    console.log(domains)
    res.sendStatus(200)
  })

module.exports = app
