var pkg = require('./package.json');
var Greenlock = require('greenlock');
// const models = require('./app/models')
var greenlock = Greenlock.create({
    // store: require('greenlock-store-sequelize')({ db:  }),
    packageRoot: __dirname,
    configDir: "./greenlock.d",
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