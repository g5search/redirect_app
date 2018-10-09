require('dotenv').config()
// set up a table in the DB with some seed data
var models = require('./models')

module.exports = async function () {
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
					secure_destination: true
				}
			}
		]
		for (let i = 0; i < seed_info.length; i++) {
			var domain = await models.domain_test.create(seed_info[i].domain_table)
			// set the domain id for the redirect_table
			if (seed_info[i].redirect_table !== null) {
				seed_info[i].redirect_table.domain_id = domain.id
				// seed the redirect table with the correct domain id
				await models.redirect_test.create(seed_info[i].redirect_table)
			}
		}
	} catch (err) {
		console.log(err)
	}
	global.__db__ = models.sequelize
}
