'use strict';
var fs = require('fs')
var path = require('path')
const Sequelize = require('sequelize')
var sequelize = null
if (process.env.NODE_ENV !== 'test') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		pool: {
			max: process.env.DATABASE_MAX_CONNECTIONS,
			min: process.env.DATABASE_MIN_CONNECTIONS,
			idle: process.env.DATABASE_IDLE,
			acquire: process.env.DATABASE_AQUIRE,
			evict: process.env.DATABASE_EVICT,
		},
		dialectOptions: {
			// convert the string to a boolean
			ssl: (process.env.DATABASE_SSL == 'true')
		}
	}
	)
} else {
	sequelize = new Sequelize(process.env._TEST_DATABASE_URL, {
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
}

var db = {}

fs
	.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
	.forEach(function (file) {
		var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db)
  }
})


db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db