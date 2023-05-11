module.exports = async function () {
  require('dotenv').config();
  const models = require('../app/models');
  await models.sequelize.sync();
  const seedInfo = [
    {
      domain_table: {
        domain: 'forward.com',
      },
      redirect_table: null
    },
    {
      domain_table: {
        domain: 'redirect.com'
      },
      redirect_table: {
        secure_destination: true,
        destination: 'www.redirect.com/test',
        path: '/redirect/test',
      }
    },
    {
      domain_table: {
        domain: 'wildcard.com'
      },
      redirect_table: {
        path: '/wildcard',
        wildcard: true,
        destination: 'www.wildcard.com/wildcard/subdir',
        secure_destination: true
      }
    },
    {
      domain_table: {
        domain: 'nonsecure.com'
      },
      redirect_table: {
        secure_destination: false,
        destination: 'www.nonsecure.com',
        path: '/nonsecure',
      }
    },
    {
      domain_table: {
        domain: 'nonsecure.com'
      },
      redirect_table: {
        secure_destination: true,
        destination: 'www.secure.com',
        path: '/secure',
      }
    },
    {
      domain_table: {
        domain: 'secure.com'
      },
      redirect_table: {
        secure_destination: false,
        destination: 'www.nonsecure.com',
        path: '/nonsecure',
      }
    },
    {
      domain_table: {
        domain: 'secure.com'
      },
      redirect_table: {
        secure_destination: true,
        destination: 'www.secure.com',
        path: '/secure',
      }
    },
    {
      domain_table: {
        domain: 'domain.com'
      },
      redirect_table: {
        secure_destination: true,
        destination: 'www.secure.com',
        path: '/secure',
      }
    },
    {
      domain_table: {
        domain: 'domain.com'
      },
      redirect_table: {
        secure_destination: false,
        destination: 'www.nonsecure.com',
        path: '/secure',
      }
    },
    {
      domain_table: {
        domain: 'loop.com'
      },
      redirect_table: {
        secure_destination: false,
        destination: 'loop.com/',
        path: '/',
      }
    },
    {
      domain_table: {
        domain: 'subdomain.test.com'
      },
      redirect_table: {
        secure_destination: false,
        destination: 'subdomain.test.com',
        path: '/',
      }
    },
    {
      domain_table: {
        domain: 'test.com'
      },
      redirect_table: {
        wildcard: true,
        secure_destination: false,
        destination: 'www.test.com/subdir',
        path: '/wildcard/',
      }
    }
  ];

  for (const { redirect_table, domain_table } of seedInfo) {
    const domain = await models.domain.create(domain_table);
    if (redirect_table !== null) {
      redirect_table.domain_id = domain.id;
      await models.redirect.create(redirect_table);
    }
  }
  global.__db__ = models.sequelize;
};
