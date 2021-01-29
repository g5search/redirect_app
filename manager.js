require('dotenv').config()
const defaults = {
  "store": {
    "module": "greenlock-store-fs"
  },
  "challenges": {
    "http-01": {
      "module": "acme-http-01-standalone"
    }
  },
  "renewOffset": "-45d",
  "renewStagger": "3d",
  "accountKeyType": "EC-P256",
  "serverKeyType": "RSA-2048",
  "subscriberEmail": "tyler.hasenoehrl@getg5.com",
  "agreeToTerms": true
}
const models = require('./app/models')
const { Op } = models.Sequelize
module.exports.create = function (options) {
  var manager = {};

  //
  // REQUIRED (basic issuance)
  //

  // Get
  manager.get = async function ({ servername, wildname }) {
    console.log('get')
    // Required: find the certificate with the subject of `servername`
    // Optional (multi-domain certs support): find a certificate with `servername` as an altname
    // Optional (wildcard support): find a certificate with `wildname` as an altname
    const site = await models.site.findOne({ where: { servername } })
    if (site) {
      const {
        servername,
        altnames,
        renewAt,
        deletedAt,
        challenges
      } = site.toJSON()
      return { servername, altnames, renewAt: renewAt ? renewAt : 1 , deletedAt, challenges }
    } else {
      return null
    }
  };

  // Set
  manager.set = async function (opts) {
    console.log('set')
    console.log({ opts })
    // { subject, altnames, renewAt, deletedAt }
    // Required: updated `renewAt` and `deletedAt` for certificate matching `subject`
    const [site] = await models.site.findOrCreate({
      where: {
        servername: opts.subject
      },
      defaults: {
        servername: opts.subject,
        altnames: opts.altnames,
        deletedAt: opts.deletedAt,
        renewAt: opts.renewAt
      }
    })
    await site.update({ altnames: opts.altnames, deletedAt: opts.deletedAt, renewAt: opts.renewAt })
    return null
  };

  //
  // Optional (Fully Automatic Renewal)
  //
  manager.find = async function (opts) {
    console.log('find')
    console.log('opts', opts)
    // { subject, servernames, altnames, renewBefore }
    console.log('servername 1', opts.servername)
    if (opts.subject) {
      console.log('servername 2', opts.servername)
      const site = await models.site.findOne({
        where: {
          servername: opts.servername
        }
      })
      console.log('site', site)
      if (site) {
        const {
          servername,
          altnames,
          renewAt,
          deletedAt
        } = site.toJSON()
        console.log('returning 1')
        return [{ servername, altnames, renewAt, deletedAt }];
      } else {
        console.log('returning 2')
        return []
      }
    }

    if (opts.servernames) {
      const sites = await models.site.findAll({
        where: {
          altnames: {
            [Op.contains]: opts.servernames
          }
        }
      }).then(s => s.map((s) => {
        const {
          servername,
          altnames,
          renewAt,
          deletedAt
        } = s.toJSON()
        return { servername, altnames, renewAt, deletedAt }
      }))
      return sites
    }
    return getSitestoRenew(opts.renewBefore || Infinity)
  };

  manager.remove = async function (opts) {
    console.log(opts)
    const site = await models.site.findOne({ where: { servername: opts.subject } })
    if (site) {
      console.log('here')
      await site.destroy()
      const { servername: subject, deletedAt, altnames } = site.toJSON()
      return { subject, altnames }
    }
  }


  //
  // Optional (special settings save)
  // Implemented here because this module IS the fallback
  //
  // manager.defaults = async function (options) {
  //   if (!options) {
  //     return defaults
  //   }
  //   return mergeDefaultConfigValues(options);
  // };

  function mergeDefaultConfigValues(options) {

  }
  //
  // Optional (for common deps and/or async initialization)
  //
  /*
  manager.init = async function(deps) {
      manager.request = deps.request;
      return null;
  };
  //*/

  return manager;
};

async function getSitestoRenew(renewAt) {
  console.log('renewAt', renewAt)
  const query = {}
  if (renewAt !== Infinity) {
    query.where = {
      renewAt: {
        [Op.gte]: renewAt
      }
    }
  }
  const sites = await models.site.findAll(query)
    .then(s => s.map((s) => {
      const {
        servername: subject,
        altnames,
        renewAt,
        deletedAt
      } = s.toJSON()
      return { subject, altnames, renewAt, deletedAt }
    }))
    console.log(sites)
    return sites
}
