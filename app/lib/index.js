const app = require('express')()
const redirects = require('./redirect')

app.use(require('helmet')())

// respond to all GET requests
app.get('*', ({ path, hostname, protocol }, res) => {
	redirects.get(hostname, path).then(redirect => {
		if ('destination' in redirect)
			if (redirect.destination !== `${protocol}://${hostname}${path}`) // check for redirect loop
				res.redirect(301, redirect.destination)
			else
				res.send(`${hostname} is incorrectly configured creating a redirect loop`)
	}).catch(err => res.send(err.toString()))
})

module.exports = app