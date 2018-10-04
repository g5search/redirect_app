var redirect = require('./redirect')
var models = require('../models')
module.exports = {
    getDestination
}
function getDestination(host, path) {
    return getWildcards(host)
        .then(wildcards => {
        console.log('wildcards.length')
        console.log(wildcards.length)
        if (wildcards.length > 0) {
            //look for a partial string match on the path
            for (i = 0; i < wildcards[0].redirects.length; i++) {
                let redirect_path = wildcards[0].redirects[i].path
                if (path.indexOf(redirect_path) >= 0) {
                    console.log('formatting wildcard redirect')
                    console.log({
                        domain: wildcards[0].domain,
                        redirects: [
                            wildcards[0].redirects[i].dataValues
                        ]
                    })
                    return redirect.format({
                        domain: wildcards[0].domain,
                        redirects: [
                            wildcards[0].redirects[i].dataValues
                        ]
                    })
                }
            }
        }
        return null
    })
}

function getWildcards(host) {
    return models.domain.findAll({
        where: {
            domain: host
        },
        include: [
            {
                model: models.redirect,
                where: {
                    wildcard: true
                }
            }
        ],
        order: [['updatedAt', 'DESC']]
    })
}