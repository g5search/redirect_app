var pkg = require('./package.json');
var Greenlock = require('greenlock');
var greenlock = Greenlock.create({
    packageRoot: __dirname,
    configDir: "./greenlock.d/",
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

// greenlock.manager
//     .defaults({
//         agreeToTerms: true,
//         subscriberEmail: 'webhosting@example.com'
//     })
//     .then(function(fullConfig) {
//         // ...
//     });

module.exports = greenlock