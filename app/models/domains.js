const { INTEGER, STRING, DATE } = require('sequelize');

module.exports = (sequelize) => {
  const domains = sequelize.define('domain', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    site_id: {
      type: INTEGER,
      notEmpty: true
    },
    deletedAt: {
      type: DATE,
      defaultValue: null
    },
    domain: {
      type: STRING,
      notEmpty: true
    },
    lastUsed: {
      type: DATE
    }
  });

  domains.associate = (models) => {
    models.domain.hasMany(models.redirect, {
      foreignKey: 'domain_id',
      sourceKey: 'id'
    });
  };

  return domains;
};
