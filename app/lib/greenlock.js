const path = require('path');
const Greenlock = require('@root/greenlock');
const pkg = require('../../package.json');
const logger = require('./logging');

const {
  GREENLOCK_MAINTAINER_EMAIL,
  GREENLOCK_DIR,
  GREENLOCK_DEBUG
} = process.env;

const packageRoot = path.join(__dirname, '../../');

const greenlock = Greenlock.create({
  packageRoot,
  configDir: GREENLOCK_DIR,
  manager: './app/lib/manager.js',
  packageAgent: `${pkg.name}/${pkg.version}`,
  maintainerEmail: GREENLOCK_MAINTAINER_EMAIL,
  notify: function (event, details) {
    if ('error' === event) {
      // `details` is a large string with all the html from any 404 pages
      logger(details);
    }
    logger({ event, details });
  },
  staging: GREENLOCK_DEBUG === 'true'
});

module.exports = greenlock;
