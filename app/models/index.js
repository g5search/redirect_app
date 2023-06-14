const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const {
  DATABASE_URL,
  DATABASE_URL_TEST,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_NAME,
  DATABASE_MAX_CONNECTIONS,
  DATABASE_MIN_CONNECTIONS,
  DATABASE_IDLE,
  DATABASE_AQUIRE,
  DATABASE_EVICT,
  DATABASE_SSL,
  DATABASE_LOGGING
} = process.env;

const DATABASE_URL_ENV = process.env.NODE_ENV === 'test' ? DATABASE_URL_TEST : DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL_ENV, {
  pool: {
    max: parseInt(DATABASE_MAX_CONNECTIONS),
    min: parseInt(DATABASE_MIN_CONNECTIONS),
    idle: parseInt(DATABASE_IDLE),
    acquire: parseInt(DATABASE_AQUIRE),
    evict: parseInt(DATABASE_EVICT)
  },
  dialectOptions: {
    ssl: DATABASE_SSL === 'true'
  },
  logging: DATABASE_LOGGING === 'true' ? console.log : false
});

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 &&
                  file !== 'index.js' &&
                  file !== 'sync.js' &&
                  file !== 'prototypes' &&
                  file !== 'hooks' &&
                  file !== 'README.md'
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    const { name } = model;
    db[name] = model;
  });

Object
  .keys(db)
  .forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

module.exports = {
  sequelize,
  Sequelize,
  ...db
};
