const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const {
  DATABASE_URL,
  DATABASE_MAX_CONNECTIONS,
  DATABASE_MIN_CONNECTIONS,
  DATABASE_IDLE,
  DATABASE_AQUIRE,
  DATABASE_EVICT,
  DATABASE_SSL
} = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  pool: {
    max: DATABASE_MAX_CONNECTIONS,
    min: DATABASE_MIN_CONNECTIONS,
    idle: DATABASE_IDLE,
    acquire: DATABASE_AQUIRE,
    evict: DATABASE_EVICT,
  },
  dialectOptions: {
    ssl: DATABASE_SSL === 'true'
  }
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function (file) {
    const model = sequelize.import(path.join(__dirname, file))
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