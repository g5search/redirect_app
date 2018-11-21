const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const {
	DATABASE_URL: dbUrl,
	DATABASE_MAX_CONNECTIONS: max,
	DATABASE_MIN_CONNECTIONS: min,
	DATABASE_IDLE: idle,
	DATABASE_AQUIRE: acquire,
	DATABASE_EVICT: evict,
	DATABASE_SSL: ssl,
	NODE_ENV } = process.env

const sequelize = NODE_ENV === 'test' ? new Sequelize(dbUrl, {
	pool: { max, min, idle, acquire, evict },
	dialectOptions: { ssl: (ssl === 'true') }
}) : new Sequelize(process.env._TEST_DATABASE_URL, {
	pool: {
		max: process.env._TEST_DATABASE_MAX_CONNECTIONS,
		min: process.env._TEST_DATABASE_MIN_CONNECTIONS,
		idle: process.env._TEST_DATABASE_IDLE,
		acquire: process.env._TEST_DATABASE_AQUIRE,
		evict: process.env._TEST_DATABASE_EVICT,
	},
	dialectOptions: {
		// convert the string to a boolean
		ssl: (process.env._TEST_DATABASE_SSL == 'true')
	}
})

const db = fs.readdirSync(__dirname)
	.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js')) // get all the model files
	.reduce((db, file) => {
		const model = sequelize.import(path.join(__dirname, file))
		const { name } = model
		db[name] = model
		if ('associate' in db[name]) db[name].associate(db)
	}, {})

module.exports = Object.assign(db, { sequelize })