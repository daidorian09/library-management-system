import express from 'express';
import morgan from 'morgan';

import config from './config.js';
import router from './routes/index.js';
import globalErrors from './helpers/globalErrors.js';

console.log(config);

const app = express();
app.use(express.json());

async function start() {
  try {
    app.use(morgan("combined"))
    app.use(config.server.prefix, router);

    app.use(globalErrors());

    app.listen(config.server.port, () => {
      console.log(`Start server, port: ${config.server.port}`);
    });
  } catch (error) {
    console.log('Erroasdsadr', error);
  }
}

start();

process.on('SIGINT', () => {
  console.info('application is shutting down');
});
