require('dotenv').config()
const models = require('./app/models')
const app = require('./app/lib/index.js')

require("greenlock-express")
    .init({
      store: require('@greenlock/store-sequelize').create({ db: models.sequelize }),
      packageRoot: __dirname,
        // contact for security and critical bug notices
        // configDir: "./greenlock.d",
        maintainerEmail: 'tyler.hasenoehrl@getg5.com',
        // whether or not to run at cloudscale
        cluster: false
    })
    // Serves on 80 and 443
    // Get's SSL certificates magically!
    .serve(app);

// Sync the Database
models.sequelize
  .sync()
  .then(() => {
    console.log("Models Sync'd")
  })
  .catch(console.error)

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
