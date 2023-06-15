const wildcard = require('./wildcard');
const models = require('../models');
const logger = require('./logging');

/**
 *
 * @param {*} host
 * @param {*} path
 * @returns {{destination: string}}
 */
async function get (host, path) {
  const destinations = await getDestination(host, path);

  if (destinations.length > 1) {
    throw new Error('multiple domains have been found');
  }

  if (destinations.length === 1) {
    return format(destinations[0].redirects);
  }

  const wildcards = await wildcard.getDestination(host, path);
  return wildcards ? format(wildcards.redirects) : forward(host, path);
}

function format([redirect, ...extras]) {
  if (extras.length || !redirect) {
    throw new Error(
      `Found an invalid number of redirects, count: ${extras.length +
      (redirect ? 1 : 0)}`
    );
  }
  return {
    destination: `http${redirect.secure_destination ? 's' : ''}://${redirect.destination}`
  };
}

function getDestination (domain, path) {
  return models.domain
    .findAll({
      where: { domain },
      include: [{
        model: models.redirect,
        where: { path }
      }]
    })
    .then(async (destinations) => {
      if (destinations.length === 0) {
        logger.warn('No destinations found in the database.', destinations);
      }
      let srcDomain = destinations;
      try {
        if (srcDomain.length === 0) {
          // retrieves one or more domain entries regardless of joined redirects
          srcDomain = await models.domain.findAll({ where: { domain } });
        }
        if (srcDomain.length > 0) {
          // only updates the most recently added domain's lastUsed date (when there are multiple entries)
          await srcDomain[0].update({ lastUsed: new Date() });
        } else {
          logger.warn('No incoming domain provided or destinations found in the database.', JSON.stringify({ destinations, srcDomain }));
        }
      } catch (error) {
        logger.error(error);
      }

      // returns what it receives
      return destinations;
    });
}

function forward (host, path) {

  // checks root domain is the same as the host
  const [rootdomain] = host.match(
    /[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/
  );

  // checks for internal redirects, which aren't stored in this tool
  if (rootdomain !== host) {
    throw new Error('Redirects are not configured for this subdomain');
  }


  // forwards to the http://www. in case a site went live without an SSL attached
  return { destination: `http://www.${host}${path}` };
}

module.exports = {
  get,
  format,
  getDestination
};
