require('dotenv').config();
// const { GREENLOCK_MAINTAINER_EMAIL, GREENLOCK_DIR } = process.env;

// const greenlock = require('@root/greenlock-express');
const app = require('./app/lib/index.js');
const models = require('./app/models');
// const pkg = require('./package.json');

models.sequelize
  .sync()
  .then(() => { console.info('Database schema synced!'); })
  .catch(e => console.error(e));

app.listen(process.env.PORT, () => {
  console.info(`Listening on port ${process.env.PORT}`);
});

// greenlock
//   .init({
//     packageRoot: __dirname,
//     configDir: GREENLOCK_DIR,
//     maintainerEmail: GREENLOCK_MAINTAINER_EMAIL,
//     packageAgent: `${pkg.name}/${pkg.version}`,
//     cluster: false
//   })
//   .serve(app);
