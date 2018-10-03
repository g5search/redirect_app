require('dotenv').config()
var models = require('./app/models')

//Sync the Database
models.sequelize.sync().then(function () {
  console.log('Nice! Database looks fine')
}).catch(function (err) {
  console.log(err, "Something went wrong with the Database Update!")
});

var glx = require('greenlock-express').create({
  version: 'draft-11',                                // Let's Encrypt v2 is ACME draft 11
  server: process.env.GREENLOCK_SERVER,              // If at first you don't succeed, stop and switch to staging
  configDir: process.env.GREENLOCK_DIR,             // You MUST have access to write to directory where certs are saved.
  approveDomains: approveDomains,                  // Greenlock's wraps around tls.SNICallback. Check the domain name here and reject invalid ones
  app: function (req, res) {
    require('./app/lib/redirect.js')(req, res)
  },
  email: process.env.GREENLOCK_EMAIL ,                                   // Email for Let's Encrypt account and Greenlock Security
  agreeTos:(process.env.GREENLOCK_AGREETOS =="true"),                   // Accept Let's Encrypt ToS
  communityMember:(process.env.GREENLOCK_COMMUNITYMEMBER == "true"),   // Join Greenlock to get important updates, no spam
  debug: (process.env.GREENLOCK_DEBUG == "true")
});

var server = glx.listen(80, 443);
server.on('listening', function () {
  console.info(server.type + " listening on", server.address());
});

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
async function approveDomains(opts, certs, cb) {

  console.log(opts.domain);
  console.log(opts.domain);

  // Check that the hosting domain exists in the database.
  var domain = await models.domain.findAll({
    where: {
      domain: opts.domain
    }
  })
  if (domain.length > 0) {
    // the domain is in the database proceed
    console.log('passed')
    cb(null, { options: opts, certs: certs });
  } else {
    // error callback
    cb(new Error('no config found for ' + opts.domain))
    return;
  }
}