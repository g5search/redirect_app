module.exports = function (sequelize, Sequelize) {
  const domains = sequelize.define('domain', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    domain: {
      type: Sequelize.STRING,
      notEmpty: true
    }
  });
  
  domains.associate = function (models) {
    models.domain.hasMany(models.redirect, { foreignKey: 'domain_id', sourceKey: 'id' });
  };

  return domains;
};
