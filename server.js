require('dotenv').config()
const models = require('./app/models')
const app = require('./app/lib/index.js')
var pkg = require("./package.json");

// Sync the Database
models.sequelize
  .sync()
  .then(() => {
    console.log("Models Sync'd")
  })
  .catch(e => console.error(e))

require("greenlock-express")
  .init({
    packageRoot: __dirname,
    // contact for security and critical bug notices
    configDir: "./greenlock.d",
    maintainerEmail: 'tyler.hasenoehrl@getg5.com',
    packageAgent: pkg.name + "/" + pkg.version,
    // whether or not to run at cloudscale
    cluster: false
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(app);

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
