module.exports = function(sequelize, Sequelize) {
    
	var domains = sequelize.define('domain_test', {

		id: {
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER
		},

		domain: {
			type: Sequelize.STRING,
			notEmpty: true
		}

	})
	domains.associate = function(models) {
		models.domain_test.hasMany(models.redirect_test, { foreignKey: 'domain_id', sourceKey: 'id' })
	}
	return domains
}