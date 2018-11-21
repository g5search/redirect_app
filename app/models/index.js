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
	DATABASE_SSL: ssl } = process.env

const sequelize = new Sequelize(dbUrl, {
	pool: { max, min, idle, acquire, evict },
	dialectOptions: { ssl: (ssl === 'true') }
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