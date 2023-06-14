/**
 * pm2 process manager configuration
 * should be invoked with `pm2 start ecosystem.config.js`
 * or `pm2 start ecosystem.config.js --env production`
 * @see http://pm2.keymetrics.io/docs/usage/application-declaration/
 *
 */
const logger = require('./app/lib/logging');

module.exports = {
  apps: [{
    name: 'redirect_app',
    script: './server.js',
    watch: true,
    out_file: 'logs/my-app-out.log',
    error_file: 'logs/my-app-err.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    env: {NODE_ENV: 'staging'},
    env_production: {NODE_ENV: 'production'}
  }],
  deploy: {
    production: {
      user: 'redirect_app',
      host: 'domain-forwarder.g5dns.com',
      ref: 'origin/master',
      repo: 'git@github.com/g5search/redirect_app.git',
      path: '/home/redirect_app/redirect_app',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};

/**
 * pm2 process logs to file for cloud logging service
 */
const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + 'logs/my-app-out.log', {flags: 'w'});
const log_stdout = process.stdout;

console.log = function(d) {
  logger.info(util.format(d));
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

console.error = function(d) {
  logger.error(util.format(d));
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
