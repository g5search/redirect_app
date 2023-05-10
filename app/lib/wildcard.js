const models = require('../models');

module.exports = {
  getDestination
};

/**
 * Finds and formats wildcards as paths for request path pattersn and host
 * @param {string} host
 * @param {string} path
 * @returns {undefined | {domain: string, redirects: [string]}}
 */
async function getDestination (host, path) {
  const wildcards = await getWildcards(host);

  if (wildcards.length > 0) {
    for (let i = 0; i < wildcards[0].redirects.length; i++) {
      let redirect_path = wildcards[0].redirects[i].path;
      if (redirect_path.charAt(redirect_path.length - 1) !== '/') {
        redirect_path = redirect_path + '/';
      }
      if (path.indexOf(redirect_path) >= 0) {
        return {
          domain: wildcards[0].domain,
          redirects: [
            wildcards[0].redirects[i].dataValues
          ]
        };
      }
    }
  }

  return;
}

/**
 * Returns wildcard redirect records for a given host
 * @param {String} host 
 * @returns {Array}
 */
async function getWildcards (host) {
  return await models.domain.findAll({
    where: { domain: host },
    include: [{
      model: models.redirect,
      where: { wildcard: true }
    }],
    order: [['updatedAt', 'DESC']]
  });
}
