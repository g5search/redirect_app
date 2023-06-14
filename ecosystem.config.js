/**
 * pm2 process manager configuration
 * should be invoked with `pm2 start ecosystem.config.js`
 * or `pm2 start ecosystem.config.js --env production`
 * @see http://pm2.keymetrics.io/docs/usage/application-declaration/
 *
 */
require('dotenv').config();
const logger = require('./app/lib/logging');

module.exports = {
  apps: [{
    name: 'redirect_app',
    script: './server.js',
    watch: false,
    out_file: 'logs/process.log',
    error_file: 'logs/errors.log',
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
      path: '/home/opex/redirect_app',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
