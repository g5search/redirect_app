const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const {
  DATABASE_URL: dburl,
  DATABASE_MAX_CONNECTIONS: max,
  DATABASE_MIN_CONNECTIONS: min,
  DATABASE_IDLE: idle,
  DATABASE_AQUIRE: acquire,
  DATABASE_EVICT: evict,
  DATABASE_SSL: ssl,
  DATABASE_LOGGING: logging,
} = process.env

const minTest = parseInt(min)
const maxTest = parseInt(max)
const idleTest = parseInt(idle)
const acquireTest = parseInt(acquire)
const evictTest = parseInt(evict)
const sequelize = new Sequelize(dburl, {
  pool: {
    max: maxTest,
    min: minTest,
    idle: idleTest,
    acquire: acquireTest,
    evict: evictTest
  },
  dialectOptions: {
    ssl: (ssl === 'true') ? { ca, cert, key } : false
  },
  logging: (logging === 'true')
})


const db = {}

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 &&
                  file !== 'index.js' &&
                  file !== 'sync.js' &&
                  file !== 'prototypes' &&
                  file !== 'hooks' &&
                  file !== 'README.md'
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize)
    const { name } = model
    db[name] = model
  })

Object.keys(db)
  .forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db)
    }
  })

module.exports = {
  ...db,
  sequelize,
  Sequelize
}
