const models = require('../models')

let getDestination = async (host, path) => {
  const [wildcard] = await getWildcards(host)
  if (typeof wildcard == 'undefined') {
    return
  }

  for (const redirect of wildcard.redirects) {
    let redirectPath = redirect.path
    if (redirectPath.split('').pop() !== '/') {
      redirectPath += '/'
    }
    if (path.includes(redirectPath)) {
      return {
        domain: wildcard.domain,
        redirects: [redirect.dataValues]
      }
    }
  }
  throw new Error('No matching redirect found')
}

const getWildcards = domain =>
  models.domain.findAll({
    where: { domain },
    include: [
      {
        model: models.redirect,
        where: { wildcard: true }
      }
    ],
    order: [['updatedAt', 'DESC']]
  }).then(async (destinations) => {
    let srcDomain = destinations
    try {
    console.log('getWildcards', { destinations })
    console.log(srcDomain.length)
    if (srcDomain.length === 0 ) {
      srcDomain = await models.domain.findAll({ where: { domain }})
    }
    await destinations[0].update({ lastUsed: new Date() })
    } catch (error) {
     console.error(error) 
    }
    return destinations
  })

module.exports = {
  getDestination
}
