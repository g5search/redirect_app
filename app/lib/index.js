const express = require('express');
const app = express();
const helmet = require('helmet');

module.exports = app;

app.use(helmet());

const redirects = require('./redirect');

app.get('*', redirect);

async function redirect (req, res) {
  const path = req.path;
  const host = req.hostname;
  const protocol = req.protocol;
  const reqURL = `${protocol}://${host}${path}`;

  console.info(`Received request for ${reqURL}`);

  const redirect = await redirects.get(protocol, host, path);

  if ('destination' in redirect) {
    if (redirect.destination !== reqURL) {
      res.redirect(301, redirect.destination);
    } else {
      res.send(`${host} is incorrectly configured creating a redirect loop.`);
    }
  } else {
    res.send(redirect.error);
  }
}
