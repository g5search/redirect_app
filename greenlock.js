var pkg = require('./package.json');
var Greenlock = require('@root/greenlock');
const models = require('./app/models')
console.log(models.sequelize)
var greenlock = Greenlock.create({
    store: require('@greenlock/store-sequelize').create({ db: models.sequelize }),
    packageRoot: __dirname,
    // configDir: "./greenlock.d",
    packageAgent: pkg.name + '/' + pkg.version,
    maintainerEmail: 'tyler.hasenoehrl@getg5.com',
    staging: true,
    notify: function(event, details) {
        if ('error' === event) {
            // `details` is an error object in this case
            console.error(details);
        }
    }
});

module.exports = greenlock