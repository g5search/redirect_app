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
      logger.info(`Searching for redirects with pattern: ${req.query.search}`);
      const websites = await models.site.findAll({
        where: {
          servername: {[models.Sequelize.Op.like]: `%${req.query.search}%`},
          deletedAt: null
        },
        include: [{
          model: models.domain,
          include: [{ model: models.redirect }]
        }]
      });
      res.send(websites);
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
 * @api {post} /api/v1/create
 * @apiParam {Object[]} body
 * @returns status 201 or 500
 */
app.post('/api/v1/create', express.json(), async (req, res) => {
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

      // make sure domain doesn't have protocol and is URL-like
      const formattedDomain = await validateAndFormatDomain(domain);
      // not sure that greenlock.add and greenlock.manager.set are the same
      // await greenlock.add({
      //   subject: formattedDomain,
      //   servername: formattedDomain,
      //   altnames: [formattedDomain]
      // });

      const site = await greenlock.manager.set({
        subject: formattedDomain,
        altnames: [formattedDomain]
      });
      
      // const site = await models.site.findOne({
      //   where: { servername: formattedDomain }
      // });

      const [dbDomain] = await models.domain.findOrCreate({
        where: { domain: formattedDomain },
        defaults: {
          domain: formattedDomain,
          site_id: site.id
        }
      });

      logger.info({ message: dbDomain });

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
    logger.warn({ message: error.message });
    errors.push(error.mesage);
  }

  if (errors.length > 0) {
    res.status(500).send(errors);
  } else {
    res.sendStatus(201);
  }
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




// utilities that don't have a home yet

async function validateAndFormatDomain (domain) {
  return new Promise((resolve, reject) => {
    // Regex to check if string is a URL-like domain
    const urlPattern = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/g;

    // Check if domain is a valid URL-like domain
    const domainMatch = domain.match(urlPattern);
    if (domainMatch) {
      // If domain contains protocol, remove it
      resolve(domain.replace(/(http:\/\/|https:\/\/)/g, ''));
    } else {
      // If not a valid URL-like domain, return null or handle error as needed
      reject(new Error({ message: `${domain} is not a valid URL-like domain.` }));
    }
  });
}