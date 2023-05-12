const Greenlock = require('@root/greenlock');
const pkg = require('./package.json');

const {
  GREENLOCK_MAINTAINER_EMAIL,
  GREENLOCK_DIR
} = process.env;

const greenlock = Greenlock.create({
  packageRoot: __dirname,
  configDir: GREENLOCK_DIR,
  manager: './manager.js',
  packageAgent: `${pkg.name}/${pkg.version}`,
  maintainerEmail: GREENLOCK_MAINTAINER_EMAIL,
  notify: function (event, details) {
    if ('error' === event) {
      console.warn(details);
    }
    console.info({ event, details });
  }
});

module.exports = greenlock;
