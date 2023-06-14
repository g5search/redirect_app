require('dotenv').config(); // import env again to support npx command
const models = require('../models');
const { Op } = models.Sequelize;

// TODO kept all the functional code. Looks like they were trying to implement an auto renew feature?
module.exports.create = function () {
  const manager = {};

  manager.get = async function ({ servername }) {
    const site = await models.site.findOne({ where: { servername } });
    if (site) {
      const {
        servername,
        altnames,
        renewAt,
        deletedAt,
        challenges
      } = site.toJSON();
      return {
        subject: servername,
        altnames: [altnames],
        renewAt: renewAt ? renewAt : 1 ,
        deletedAt,
        challenges
      };
    } else {
      return null;
    }
  };

  manager.set = async function (opts) {
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
    });
    await site.update({ altnames: opts.altnames, deletedAt: opts.deletedAt, renewAt: opts.renewAt });
    return site;
  };

  // this doesn't appear be used anywhere
  manager.find = async function (opts) {
    if (opts.servername) {
      const site = await models.site.findOne({
        where: { servername: opts.servername, deletedAt: null },
        include: [{
          model: models.domain,
          include: [{ model: models.redirect }]
        }]
      });
      if (site) {
        return [site.toJSON()];
      } else {
        return [];
      }
    }
    const sites = await getSitesToRenew(opts.renewBefore || Infinity);
    if (sites) {
      return sites;
    }
    return [];
  };

  manager.remove = async function (opts) {
    const site = await models.site.findOne({ where: { servername: opts.subject } });
    if (site) {
      await site.destroy();
      const { servername: subject, deletedAt, altnames } = site.toJSON();
      return { subject, altnames, deletedAt };
    }
  };

  return manager;
};

async function getSitesToRenew (renewAt) {
  const query = {};
  if (renewAt !== Infinity) {
    query.where = {
      renewAt: {
        [Op.gte]: renewAt
      }
    };
  }

  return await models.site
    .findAll(query)
    .then(s => s.map((s) => {
      const {
        servername: subject,
        altnames,
        renewAt,
        deletedAt
      } = s.toJSON();
      return { subject, altnames: altnames, renewAt, deletedAt };
    }))
    .catch((error) => {
      console.warn('Chances are this table is empty. Add some domains!', error);
      return [];
    });
}
