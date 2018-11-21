const { INTEGER, STRING } = require('sequelize');

module.exports = function (sequelize) {
	const domains = sequelize.define('domain', {
		id: {
			autoIncrement: true,
			primaryKey: true,
			type: INTEGER
		},
		domain: {
			type: STRING,
			notEmpty: true
		}
	})
	domains.associate = function (models) {
		models.domain.hasMany(models.redirect, { foreignKey: 'domain_id', sourceKey: 'id' })
	}
	return domains
}