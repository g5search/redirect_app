const app = require('express')()

app.use(require('helmet')()) // disable for security

const redirects = require('./redirect')

// respond to all GET requests
app.get('*', ({ path, hostname, protocol }, res) => {
	redirects.get(protocol, hostname, path).then(redirect => {
		if ('destination' in redirect)
			if (redirect.destination !== `${protocol}://${hostname}${path}`) // check for redirect loop
				res.redirect(301, redirect.destination)
			else
				res.send(`${hostname} is incorrectly configured creating a redirect loop`)
		else res.send(redirect.error)
	})
})

module.exports = app