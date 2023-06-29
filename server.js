require('dotenv').config();

const {
  GREENLOCK_MAINTAINER_EMAIL,
  GREENLOCK_DIR,
  NODE_ENV,
  PORT
} = process.env;

const greenlock = require('@root/greenlock-express');
const app = require('./app/lib/index.js');
const logger = require('./app/lib/logging');
const models = require('./app/models');
const pkg = require('./package.json');

(async () => {
  await models.sequelize
    .sync()
    .then(() => { logger.info('Database schema synced!'); })
    .catch(e => logger.error(e));

  greenlock
    .init({
      packageRoot: __dirname,
      configDir: GREENLOCK_DIR,
      maintainerEmail: GREENLOCK_MAINTAINER_EMAIL,
      packageAgent: `${pkg.name}/${pkg.version}`,
      cluster: false
    })
    .serve(app);

  if (NODE_ENV === 'development') {
    /**
     * greenlock express attaches to 80 and 443, so we need another port locally
     */
    app.listen(PORT, () => {
      logger.info(`Listening on port ${PORT}!`);
    });
  }
})();
