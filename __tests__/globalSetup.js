require('dotenv').config()
// set up a table in the DB with some seed data
var models = require('./models')

async function spinUpDatabase() {
	await models.spinUpDatabase.sync()
	var seed_info = [
		{
			domain_table: {
				domain: 'forward.com',
			},
			redirect_table: {
				path: '/sudDir/test'
			}
		},
		{
			domain_table: {
				domain: 'redirect.com',
				path: '/redirect/test',
			},
			redirect_table: {
				secure_destination: true,
				destination: 'www.redirect.com/test'
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
	for (let i = 0 ; i < seed_info.length; i++) {
		// seed the domain table
		var domain = await models.domain_test.create(seed_info[i].domain_table)
		// set the domain id for the redirect_table
		seed_info[i].redirect_table.domain_id = domain[0].id 
		// seed the redirect table with the correct domain id
		await models.redirect_test.create(seed_info[i].redirect_table)
	}
}
//Sync the Database
return models.sequelize.sync().then(function () {
	console.log('Nice! Database looks fine')
	// seed the database now

}).catch(function (err) {
	console.log(err, 'Something went wrong with the Database Connection!')
})
// the table should contain a domain with no redirects, a domain with widlcard redirects and a domain with a plan redirect