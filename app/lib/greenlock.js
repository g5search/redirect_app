var pkg = require('../../package.json');
var Greenlock = require('greenlock');
var greenlock = Greenlock.create({
    configDir: '../greenlock.d/config.json',
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