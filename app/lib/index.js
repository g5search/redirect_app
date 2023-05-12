const express = require('express');
const redirects = require('./redirect');
const greenlock = require('../../greenlock');
const models = require('../models');

const app = express();

app.use((req, res, next) =>{
  console.log({ req, res, next, models });
  next();
});

app.get('*', ({ path, hostname }, res) => {
  redirects
    .get(hostname, path)
    .then((redirect) => {
      if (!redirect.destination.match(new RegExp(`https?://${hostname}${path}/?`))) {
        res.redirect(301, redirect.destination);
      }
      else {
        res.status(404).send(`${hostname} is incorrectly configured and creating a redirect loop.`);
      }
    })
    .catch(err => res.status(404).send(err.toString()));
});

app.post('/api/v1/backfill/used', express.json(), async (req, res) => {
  try {
    const domains = await models.domain.findAll({
      where: {
        lastUsed: {
          [models.Sequelize.Op.not]: null
        }
      },
      order: [['updatedAt', 'DESC']]
    });

    for (let i =0; i < domains.length; i++) {
      greenlock.add({
        subject: domains[i].dataValues.domain,
        altnames: [domains[i].dataValues.domain]
      });
    }
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/v1/redirects', express.json(), async (req, res) => {
  const { body } = req;
  const errors = [];
  try {
    for (let i = 0; i < body.length; i++) {
      const {
        domain,
        path,
        destination,
        secure_destination,
        wildcard
      } = body[i];

      await greenlock.add({
        subject: domain,
        altnames: [domain]
      });

      const [dbDomain] = await models.domain.findOrCreate({
        where: { domain },
        defaults: { domain }
      });

      await models.redirect
        .create({
          domain_id: dbDomain.dataValues.id,
          path,
          destination,
          secure_destination,
          wildcard
        });
    }
  } catch (error) {
    console.warn(error);
    errors.push(error);
  }

  if (errors.length > 0) {
    res.status(500).send(errors);
  }
  res.sendStatus(201);
});

app.delete('/api/v1/redirects', express.json(), async (req, res) => {
  const { domain } = req.body;
  const domains = await greenlock.manager.remove({ subject: domain });
  console.info('Removed Domains Successfully', domains);
  res.status(202).send(domains);
});

module.exports = app;
