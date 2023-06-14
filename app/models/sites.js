const { STRING, DATE, ARRAY, JSON } = require('sequelize');

module.exports = (sequelize) => {
  const sites = sequelize.define('site', {
    servername: {
      type: STRING
    },
    servernames: {
      type: ARRAY(STRING)
    },
    wildname: {
      type: STRING
    },
    altnames: {
      type: ARRAY(STRING)
    },
    renewAt: {
      type: DATE
    },
    challenges: {
      type: JSON
    }
  }, {
    paranoid: true
  });

  sites.associate = (models) => {
    models.site.hasMany(models.domain, {
      foreignKey: 'site_id',
      sourceKey: 'id'
    });
  };
  return sites;
};
