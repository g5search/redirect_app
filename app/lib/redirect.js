var wildcard = require('./wildcard')
var forward = require('./forward')
var models = require('../models')

module.exports = {
	get,
	format,
	getDestination
}
/**
 *
 *
 * @param {string} protocol
 * @param {string} host
 * @param {string} path
 * @returns {{destination: string} | {error: string}}
 */
async function get(protocol, host, path) {
	var redirect = await getDestination(host, path)
	if (redirect.length === 1) {
		return format(redirect[0])
	} else if (redirect.length > 1) {
		// the database is not right there should never be more than one of each domain in the domain table
		return { error: 'multiple domains have been found' }
	} else {
		// look for all wildcard redirects for this domain and find the first one that matches
		let wildcards = await wildcard.getDestination(host, path)
		if (wildcards !== undefined) {
			return format(wildcards)
		} else {
			// no wildcards were found so forward the domain to the http://www.
			return forward.go(host, path)
		}
	}
}
/**
 *
 *
 * @param {string} domain
 * @returns {{error: string} | {destination: string}}
 */
function format(domain) {
	if (domain.redirects.length > 1) {
		// there is more than one redirect for the domain and path this should never happen when edited through the UI
		return { error: 'more than one redirect for this domain and path' }
	} else if (domain.redirects.length === 1) {
		var redirect = domain.redirects[0]
		let destination = redirect.destination
		// is the desination secure or not
		if (redirect.secure_destination === true) {
			destination = 'https://' + destination
		} else {
			destination = 'http://' + destination
		}
		return { destination }
	} else {
		// there is no redirect for this - this code should not be reachable -
		// if there is no redirects it should have already been forwarded
		return { error: 'There is no redirect for this domain' }
	}
}

/**
 *
 *
 * @param {string} host
 * @param {string} path
 * @returns {id: int, domain: string, redirects: { path: string, desination: string, secure_destination: boolean, wildcard: boolean}}
 */
function getDestination(host, path) {
	// get redirects including wildcards in the care wherethe path is an exact match
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
