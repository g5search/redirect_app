module.exports = function (sequelize, Sequelize) {

	var request_domains = sequelize.define('request_domain', {

		id: {
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER
		},

		name: {
			type: Sequelize.STRING,
			notEmpty: true,
			unique: true
		},
		client_urn: {
			type: Sequelize.STRING,
			notEmpty: true,
		}
	},
	{
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	})
	request_domains.associate = function (models) {
		models.request_domain.hasMany(models.redirect_rule, { foreignKey: 'request_domain_id', sourceKey: 'id' })
	}
	return request_domains
}