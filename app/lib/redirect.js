const wildcard = require('./wildcard');
const forward = require('./forward');
const models = require('../models');

module.exports = {
  get,
  format,
  getDestination
};

/**
 * Works through redirect paths and wildcards to return a formatted URL
 * @param {string} protocol
 * @param {string} host
 * @param {string} path
 * @returns {{destination: string} | {error: string}}
 */
async function get (protocol, host, path) {
  const redirect = await getDestination(host, path);
  if (redirect.length === 1) {
    return format(redirect[0]);
  } else if (redirect.length > 1) {
    return { error: 'Multiple domains records have been found; How am I supposed to know which to use?' };
  } else {
    const wildcards = await wildcard.getDestination(host, path);
    if (wildcards !== undefined) {
      return format(wildcards);
    } else {
      return forward.go(host, path);
    }
  }
}

/**
 * Uses the destination records to format the URL for the redirect
 * @param {string} domain
 * @returns {{error: string} | {destination: string}}
 */
function format (domain) {
  if (domain.redirects.length > 1) {
    return { error: 'More than one redirect was found for this domain/path.' };
  } else if (domain.redirects.length === 1) {
    const redirect = domain.redirects[0];
    let destination = redirect.destination;
    if (redirect.secure_destination === true) {
      destination = `https://${destination}`;
    } else {
      destination = `http://${destination}`;
      console.warn(`${destination} is an insecure destination! These can be handled in other tools.`);
    }
    return { destination };
  } else {
    return { error: 'There were no redirect destinations found for this domain.' };
  }
}

/**
 * Fetchs all matching destinations paths for a given domain
 * @param {string} host
 * @param {string} path
 * @returns {id: int, domain: string, redirects: { path: string, desination: string, secure_destination: boolean, wildcard: boolean}}
 */
async function getDestination (host, path) {
  return await models.domain.findAll({
    where: { domain: host },
    include: [{
      model: models.redirect,
      where: { path: path }
    }]
  });
}
