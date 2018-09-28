module.exports = function (sequelize, Sequelize) {

    var redirect = sequelize.define('redirect', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        domain_id: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        path: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        destination: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        secure_destination: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });

    return redirect;

}