require('dotenv').config()
// set up a table in the DB with some seed data
var models = require('../app/models')

module.exports = async function (globalConfig) {
	try {
		await models.sequelize.sync()
		var seed_info = [
			{
				domain_table: {
					domain: 'forward.com',
				},
				redirect_table: null
			},
			{
				domain_table: {
					domain: 'redirect.com'
				},
				redirect_table: {
					secure_destination: true,
					destination: 'www.redirect.com/test',
					path: '/redirect/test',
				}
			},
			{
				domain_table: {
					domain: 'wildcard.com'
				},
				redirect_table: {
					path: '/wildcard/test',
					wildcard: true,
					destination: 'www.wildcard.com/wildcard/subdir',
					secure_destination: true
				}
			},
			{
				domain_table: {
					domain: 'nonsecure.com'
				},
				redirect_table: {
					secure_destination: false,
					destination: 'www.nonsecure.com',
					path: '/nonsecure',
				}
			},
			{
				domain_table: {
					domain: 'nonsecure.com'
				},
				redirect_table: {
					secure_destination: true,
					destination: 'www.secure.com',
					path: '/secure',
				}
			},
			{
				domain_table: {
					domain: 'secure.com'
				},
				redirect_table: {
					secure_destination: false,
					destination: 'www.nonsecure.com',
					path: '/nonsecure',
				}
			},
			{
				domain_table: {
					domain: 'secure.com'
				},
				redirect_table: {
					secure_destination: true,
					destination: 'www.secure.com',
					path: '/secure',
				}
			},
			{
				domain_table: {
					domain: 'domain.com'
				},
				redirect_table: {
					secure_destination: true,
					destination: 'www.secure.com',
					path: '/secure',
				}
			},
			{
				domain_table: {
					domain: 'domain.com'
				},
				redirect_table: {
					secure_destination: false,
					destination: 'www.nonsecure.com',
					path: '/secure',
				}
			},
			{
				domain_table: {
					domain: 'loop.com'
				},
				redirect_table: {
					secure_destination: false,
					destination: 'loop.com/',
					path: '/',
				}
			}
		]
		for (let i = 0; i < seed_info.length; i++) {
			var domain = await models.domain.create(seed_info[i].domain_table)
			// set the domain id for the redirect_table
			if (seed_info[i].redirect_table !== null) {
				seed_info[i].redirect_table.domain_id = domain.id
				// seed the redirect table with the correct domain id
				await models.redirect.create(seed_info[i].redirect_table)
			}
		}
	} catch (err) {
		console.log(err)
	}
	global.__db__ = models.sequelize
}
