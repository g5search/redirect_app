var pkg = require('./package.json');
var Greenlock = require('@root/greenlock');
// const models = require('./app/models')
var greenlock = Greenlock.create({
    // store: require('greenlock-store-sequelize')({ db:  }),
    packageRoot: __dirname,
    // contact for security and critical bug notices
    configDir: "./greenlock.d",
    maintainerEmail: 'tyler.hasenoehrl@getg5.com',
    staging: true,
    notify: function(event, details) {
        if ('error' === event) {
            // `details` is an error object in this case
            console.error(details);
        }
    }
});
greenlock.manager
    .defaults({
        agreeToTerms: true,
        subscriberEmail: 'tyler.hasenoehrl@getg5.com'
    })
    .then(function(fullConfig) {
        // ...
    });
console.log(greenlock)
module.exports = greenlock 