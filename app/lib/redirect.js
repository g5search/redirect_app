var wildcard = require('./wildcard')
var models = require('../models')

module.exports = {
	get,
	format,
	getDestination
}

let get = async (host, path) => {
	const redirect = await getDestination(host, path)

	if (redirect.length > 1) // multiple redirects
		throw new Error('multiple domains have been found')

	if (redirect.length === 1) // matching redirect
		return format(redirect[0])

	const wildcards = await wildcard.getDestination(host, path)
	return wildcards ? format(wildcards) : forward(host, path)
}

let format = ([redirect, ...extras]) => {
	if (extras.length || !redirect)
		throw new Error(`Found and invalid number of redirects, count: ${extras.length + redirect ? 1 : 0}`)

	return { destination: `http${redirect.secure_destination ? 's' : ''}://${redirect.destination}` }
}

let getDestination = (domain, path) => models.domain.findAll({
	where: { domain },
	include: [
		{
			model: models.redirect,
			where: { path }
		}
	]
})

let forward = (host, path) => {
	// check root domain is the same as the host
	var [rootdomain] = host.match(/[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/)
	// forward to the http://www. incase a site went live without an SSL attached
	if (rootdomain !== host)
		throw new Error('Redirects are not configured for this subdomain')

	return { destination: `http://www.${host}${path}` }
}