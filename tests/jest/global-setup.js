require('@babel/register');
require('@babel/polyfill/noConflict');

const { app } = require('../../src/app');

module.exports = async () => {
  global.httpServer = await new Promise((resolve, reject) => {
    try {
      app.on('ready', () => {
        const server = app.listen(process.env.PORT, () => {
          console.log(`Server is runing on localhost:${process.env.PORT} 🐳`);
          console.log(
            `Apollo server is running on localhost:${process.env.PORT}/graphql 🎉`
          );
          resolve(server);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
