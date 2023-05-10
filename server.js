const envFileName = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: envFileName });

const {
  GREENLOCK_SERVER,
  GREENLOCK_DIR,
  GREENLOCK_EMAIL,
  GREENLOCK_AGREETOS,
  GREENLOCK_COMMUNITYMEMBER,
  GREENLOCK_DEBUG
} = process.env;

const greenlockExpress = require('greenlock-express');
const models = require('./app/models');
const webServer = require('./app/lib/index');

models.sequelize.sync().then(function () {
  const server = glx.listen(80, 443);
  server.on('listening', function () {
    console.info(server.type + ' listening on', server.address());
  });
}).catch(function (err) {
  console.log('Something is wrong with the database connection!', err);
});

// TODO this function will be invoked differently in version 4
const glx = greenlockExpress.create({
  version: 'draft-11',            // AKA Let's Encrypt v2
  server: GREENLOCK_SERVER,       // If at first you don't succeed, stop and switch to staging
  configDir: GREENLOCK_DIR,       // Write access to dir required by app user
  approveDomains: approveDomains, // Greenlock wraps around tls.SNICallback
  app: function (req, res) {
    return webServer(req, res);
  },
  email: GREENLOCK_EMAIL,
  agreeTos: GREENLOCK_AGREETOS === 'true',                 
  communityMember: GREENLOCK_COMMUNITYMEMBER === 'true',
  debug: GREENLOCK_DEBUG === 'true'
});

/**
 * Gets all matching domains and feeds them into the TLS callback
 * @param {Object} opts
 * @param {*} certs
 * @param {Function} cb
 * @returns cb
 */
async function approveDomains (opts, certs, cb) {
  const domain = await models.domain.findAll({
    where: { domain: opts.domain }
  });
  if (domain.length > 0) {
    return cb(null, { options: opts, certs: certs });
  } else {
    return cb(new Error(`No entries found for ${opts.domain}`), null);
  }
}
