const { STRING, DATE, ARRAY, JSON } = require('sequelize');

module.exports = sequelize => sequelize.define('site', {
  servername: {
    type: STRING
  },
  servernames: {
    type: ARRAY(STRING)
  },
  wildname: {
    type: STRING
  },
  altnames: {
    type: ARRAY(STRING)
  },
  renewAt: {
    type: DATE
  },
  challenges: {
    type: JSON
  }
}, {
  paranoid: true
});
