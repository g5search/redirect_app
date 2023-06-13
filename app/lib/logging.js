const {Logging} = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('greenlock');

const metadata = {
  resource: {type: 'global'},
};

const logger = (message) => {
  const entry = log.entry(metadata, {message});
  log.write(entry);
};

module.exports = logger;
