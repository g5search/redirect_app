module.exports = function(sequelize, Sequelize) {
    
    var domains = sequelize.define('domain', {
 
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
 
    return domains;
 
}