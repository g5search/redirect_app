require('dotenv').config()
var models = require('./app/models')

const { GREENLOCK_SERVER: server, GREENLOCK_DIR: configDir, GREENLOCK_EMAIL: email, GREENLOCK_AGREETOS: agreeTos, GREENLOCK_COMMUNITYMEMBER: communityMember, GREENLOCK_DEBUG: debug } = process.env

//Sync the Database
models.sequelize.sync().then(_ => {
  const server = glx.listen(80, 443);
  server.on('listening', _ => console.info(`${server.type} listening on ${server.address()}`));
}).catch(console.error);

var glx = require('greenlock-express').create({
  version: 'draft-11',                                // Let's Encrypt v2 is ACME draft 11
  server,              // If at first you don't succeed, stop and switch to staging
  configDir,             // You MUST have access to write to directory where certs are saved.
  approveDomains,                  // Greenlock's wraps around tls.SNICallback. Check the domain name here and reject invalid ones
  app: (req, res) => {
    require('./app/lib/index.js')(req, res)
  },
  email,                                     // Email for Let's Encrypt account and Greenlock Security
  agreeTos: (agreeTos == 'true'),                  // Accept Let's Encrypt ToS
  communityMember: (communityMember == 'true'),   // Join Greenlock to get important updates, no spam
  debug: (debug == 'true')
});

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
async function approveDomains(options, certs, cb) {
  // Check that the hosting domain exists in the database.
  (await models.domain.findAll({
    where: { domain: options.domain }
  })).length ?
    cb(null, { options, certs }) :
    cb(new Error(`no config found for ${options.domain}`));
}