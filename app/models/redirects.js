module.exports = function (sequelize, Sequelize) {

	var redirect_rules = sequelize.define('redirect_rule', {

		id: {
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER
		},
		request_matcher: {
			type: Sequelize.STRING,
			notEmpty: true
		},
		redirect_url: {
			type: Sequelize.STRING,
			notEmpty: true
		},
		raw_redirect_line: {
			type: Sequelize.TEXT,
		},
		request_domain_id: {
			type: Sequelize.INTEGER,
			notEmpty: true
		},
		wildcard: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		createdAt: 'created_at',
		updatedAt : 'updated_at'
	})
	return redirect_rules
}