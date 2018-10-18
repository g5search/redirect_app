var models = require('../models')
module.exports = {
	getDestination
}
/**
 *
 *
 * @param {string} host
 * @param {string} path
 * @returns {undefined | {domain: string, redirects: [string]}}
 */
async function getDestination(host, path) {
	var wildcards = null
	try {
		// get all wildcards for this domain from database
		wildcards = await getWildcards(host)
	}
	catch (err) {
		console.log(err)
	}
	debugger
	if (wildcards.length > 0 && wildcards[0].redirect_rules.length > 0) {
		//look for a partial string match on the path
		for (let i = 0; i < wildcards[0].redirect_rules.length; i++) {
			let redirect_path = wildcards[0].redirect_rules[i].request_matcher
			if (redirect_path.charAt(redirect_path.length - 1) !== '/') {
				// add / to the end of the path so that dirs with a partial name match are not matched 
				// eg. domain.com/wildcards != domain.com/wildcardsstuff
				redirect_path = redirect_path + '/'
			}
			if (path.indexOf(redirect_path) >= 0) {
				return {
					name: wildcards[0].name,
					redirect_rules: [wildcards[0].redirect_rules[i]]
				}
			}
		}
	}
	return undefined
}

function getWildcards(host) {
	return models.request_domain.findAll({
		where: {
			name: host
		},
		include: [
			{
				model: models.redirect_rule,
				where: {
					wildcard: true
				}
			}
		],
		order: [[{model: models.redirect_rule}, 'request_matcher', 'DESC']]
	})
}