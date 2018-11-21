var wildcard = require('./wildcard')
var forward = require('./forward')
var models = require('../models')

module.exports = {
	get,
	format,
	getDestination
}

async function get(_, host, path) {
	const redirect = await getDestination(host, path)

	if (redirect.length > 1) // multiple redirects
		throw new Error('multiple domains have been found')

	if (redirect.length === 1) // matching redirect
		return format(redirect[0])

	const wildcards = await wildcard.getDestination(host, path)
	return wildcards ? format(wildcards) : forward.go(host, path)
}

function format([redirect, ...extras]) {
	if (extras.length || !redirect)
		throw new Error(`Found and invalid number of redirects, count: ${extras.length + redirect ? 1 : 0}`)

	return { destination: `http${redirect.secure_destination ? 's' : ''}://${redirect.destination}` }
}

function getDestination(domain, path) {
	// get redirects including wildcards in the care wherethe path is an exact match
	return models.domain.findAll({
		where: { domain },
		include: [
			{
				model: models.redirect,
				where: { path }
			}
		]
	})
}
