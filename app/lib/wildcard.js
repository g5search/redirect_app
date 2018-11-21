var models = require('../models')

let getDestination = async (host, path) => {
	const [wildcard] = await getWildcards(host)

	for (const [redirect] of wildcard.redirects) {
		var redirectPath = redirect.path
		if (redirectPath.split('').pop() !== '/')
			redirectPath += '/'
		if (path.includes(redirectPath))
			return {
				domain: wildcard.domain,
				redirects: [
					redirect.dataValues
				]
			}
	}
}

let getWildcards = domain => models.domain.findAll({
	where: { domain },
	include: [
		{
			model: models.redirect,
			where: { wildcard: true }
		}
	],
	order: [['updatedAt', 'DESC']]
})

module.exports = {
	getDestination
}
