import { createClient } from 'redis';
import config from '../config';
import logger from '../helpers/logger';

class Redis {
	constructor(options) {
		if (typeof Redis.instance === 'object') {
			return Redis.instance;
		}

		this.client = createClient({
			url: `redis://${options.username}:${options.password}@${options.host}:${options.port}`,
			db: options.db || 0,
		});

		Redis.instance = this;
	}

	getClient() {
		return this.client;
	}
}

const redisInstance = new Redis(config.redis);
const client = redisInstance.getClient();

client.on('connect', () => {
	logger.info('Client connected to Redis...');
});

client.on('error', (err) => {
	logger.error(`Redis connection error: ${err.message}`);
});

export default client;
