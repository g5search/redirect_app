require('dotenv').config()
// set up a table in the DB with some seed data
var models = require('../app/models')

module.exports = async function (globalConfig) {
	try {
		await models.sequelize.sync()
		var seed_info = [
			{
				domain_table: {
					name: 'forward.com',
				},
				redirect_table: null
			},
			{
				domain_table: {
					name: 'redirect.com'
				},
				redirect_table: [{
					redirect_url: 'https://www.redirect.com/test',
					request_matcher: '/redirect/test',
				}]
			},
			{
				domain_table: {
					name: 'wildcard.com'
				},
				redirect_table: [{
					request_matcher: '/wildcard/test',
					wildcard: true,
					redirect_url: 'https://www.wildcard.com/wildcard/subdir'
				},
				{
					request_matcher: '/wildcard/test/subdir',
					wildcard: true,
					redirect_url: 'https://www.wildcard.com/wildcard/subdir/super/sub/dir'
				}]
			},
			{
				domain_table: {
					name: 'nonsecure.com'
				},
				redirect_table: [{
					redirect_url: 'http://www.nonsecure.com',
					request_matcher: '/nonsecure',
				},
				{
					redirect_url: 'http://www.secure.com',
					request_matcher: '/secure',
				}
				]
			},
			{
				domain_table: {
					name: 'secure.com'
				},
				redirect_table: [{
					redirect_url: 'http://www.nonsecure.com',
					request_matcher: '/nonsecure',
				},
				{
					redirect_url: 'https://www.secure.com',
					request_matcher: '/secure',
				}
				]
			},
			{
				domain_table: {
					name: 'domain.com'
				},
				redirect_table: [{
					redirect_url: 'https://www.secure.com',
					request_matcher: '/secure',
				},
				{
					redirect_url: 'http://www.nonsecure.com',
					request_matcher: '/secure',
				}
				]
			},
			{
				domain_table: {
					name: 'loop.com'
				},
				redirect_table: {
					redirect_url: 'https://loop.com/',
					request_matcher: '/',
				}
			}
		]
		for (let i = 0; i < seed_info.length; i++) {
			var domain = await models.request_domain.create(seed_info[i].domain_table)
			// set the domain id for the redirect_table
			if (seed_info[i].redirect_table !== null) {
				for (let i2 = 0; i2 < seed_info[i].redirect_table.length; i2++) {
					seed_info[i].redirect_table[i2].request_domain_id = domain.id
					// seed the redirect table with the correct domain id
					await models.redirect_rule.create(seed_info[i].redirect_table[i2])
				}
			}
		}
	} catch (err) {
		console.log(err)
	}
	global.__db__ = models.sequelize
}
