const express = require('express');
const redirects = require('./redirect');
const greenlock = require('./greenlock');
const models = require('../models');
const logger = require('./logging');

const app = express();

/**
 * Logs all incoming requests
 */
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Router: ${req.hostname}${req.path}`);
  }
  next();
});


/**
 * Handles all forwarding requests to their correct destination
 * Looks for absolute matches first, then wildcard matches
 * @api {get}
 * @returns status 301 or 404 and elevates protocol to HTTPS
 */
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


app.post('/api/v1/search', express.json(), async (req, res) => {
  try {
    if (req.query.search) {
      // use query params to search for pattern matches
      logger.info('Searching for domains with pattern:', req.query.search);
      const domains = await models.domain.findAll({
        where: {
          servername: {
            [models.Sequelize.Op.like]: `%${req.query.search}%`
          },
          deletedAt: null
        },
        include: [{
          model: models.domain,
          include: [{ model: models.redirect }]
        }]
      });
      res.send(domains);
    } else {
      res.status(422).send('Missing the "?search=" query param with a string to search for.');
    }
  } catch (error) {
    res.status(503).send(error);
  }
});


/**
 * Finds all previously used domains and backfills them into greenlock
 * @api {post} /api/v1/backfill/used
 * @returns status 201 or 500
 */
app.post('/api/v1/backfill/used', async (req, res) => {
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


/**
 * Primary add endpoint for adding new domains and their redirects
 * @api {post} /api/v1/redirects
 * @apiParam {Object[]} body
 * @returns status 201 or 500
 */
app.post('/api/v1/redirects', express.json(), async (req, res) => {
  const { body } = req;
  const errors = [];
  try {
    for (let i = 0; i < body.length; i++) {
      const {
        domain,
        path,
        destination,
        // secure_destination,
        wildcard
      } = body[i];

      // not sure that greenlock.add and greenlock.manager.set are the same
      const site = await greenlock.manager.set({
        subject: domain,
        altnames: [domain]
      });

      // TODO hopefully this isn't necessary
      // const site = await models.site.findOne({
      //   where: { servername: domain }
      // });

      const [dbDomain] = await models.domain.findOrCreate({
        where: { domain },
        defaults: {
          domain,
          site_id: site.id
        }
      });

      console.log({ dbDomain });

      await models.redirect
        .create({
          domain_id: dbDomain.dataValues.id,
          path,
          destination,
          secure_destination: true, // forcing this always true
          wildcard
        });
    }
  } catch (error) {
    logger.warn(error);
    errors.push(error);
  }

  if (errors.length > 0) {
    res.status(500).send(errors);
  }
  res.sendStatus(201);
});


app.put('/api/v1/redirects', express.json(), async (req, res) => {
  // search domains and redirects to update.
  res.send('Update endpoint');
});


app.delete('/api/v1/redirects', express.json(), async (req, res) => {
  const { domain } = req.body;
  const domains = await greenlock.manager.remove({ subject: domain });
  logger.info('Removed Domains Successfully', domains);
  res.status(202).send(domains);
});

module.exports = app;
