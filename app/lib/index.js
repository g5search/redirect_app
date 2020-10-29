const app = require('express')()
const redirects = require('./redirect')
const greenlock = require('greenlock-express')
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

  app.post('/api/v1/redirects', (req, res) => {
    const domains = greenlock.sites.add({
      subject: "example.com",
      altnames: ["example.com"]
    });
  })

module.exports = app
