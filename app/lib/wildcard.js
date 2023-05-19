const models = require('../models');

const getDestination = async (host, path) => {
  const [wildcard] = await getWildcards(host);
  if (typeof wildcard == 'undefined') {
    return;
  }

  for (const redirect of wildcard.redirects) {
    let redirectPath = redirect.path;
    if (redirectPath.split('').pop() !== '/') {
      redirectPath += '/';
    }
    if (path.includes(redirectPath)) {
      return {
        domain: wildcard.domain,
        redirects: [redirect.dataValues]
      };
    }
  }
  throw new Error('No matching redirect found');
};

const getWildcards = async (domain) => {
  console.info(`Searching for wildcards for ${domain}`);
  return await models.domain.findAll({
    where: { domain },
    include: [
      {
        model: models.redirect,
        where: { wildcard: true }
      }
    ],
    order: [['updatedAt', 'DESC']]
  }).then(async (destinations) => {
    // what is destinations? I would expect records from the db
    let srcDomain = destinations;
    try {
      if (srcDomain.length === 0 ) {
        // if no wildcard redirects are found, just find the domains without the joins
        srcDomain = await models.domain.findAll({ where: { domain } });
      }
      // if any domains are found (wildcard or not), update the lastUsed date
      if (srcDomain.length > 0) {
        await srcDomain[0].update({ lastUsed: new Date() });
      }
    } catch (error) {
      console.error(error);
    }
    return destinations;
  });
};

module.exports = {
  getDestination
};
