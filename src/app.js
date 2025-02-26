import express from 'express';
import morgan from 'morgan';

import config from './config.js';
import router from './routes/index.js';
import globalErrors from './helpers/globalErrors.js';
import logger from './helpers/logger';
import client from './cache/redis';

const app = express();
app.use(express.json());

async function start() {
	try {
		await client.connect();
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

process.on('SIGINT', () => {
	logger.info(`Application is shutting down... Port: ${config.server.port}`);
	client.quit();
});
