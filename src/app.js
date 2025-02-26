import express from 'express';
import morgan from 'morgan';

import config from './config.js';
import router from './routes/index.js';
import globalErrors from './helpers/globalErrors.js';
import logger from './helpers/logger';


console.log(config);

const app = express();
app.use(express.json());

async function start() {
	try {
		app.use(morgan('combined'));
		app.use(config.server.prefix, router);

		app.use(globalErrors());

		app.listen(config.server.port, () => {
			logger.info(`Start server, port: ${config.server.port}`);
		});
	} catch (error) {
    logger.error(`Error occurred during start : ${error}`);
	}
}

start();

// Gracefully shut down the server on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info(`Application is shutting down... Port: ${port}`);

  app.close(() => {
    logger.info(`Server closed gracefully on port ${port}`);
    process.exit(0); // Exit with success code
  });
});
