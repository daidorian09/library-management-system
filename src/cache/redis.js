import { createClient } from 'redis';
import config from '../config';
import logger from '../helpers/logger';

class Redis {
	constructor(options) {
		if (typeof Redis.instance === 'object') {
			return Redis.instance;
		}

		const redisUrl = options.environment === 'dev' ? `redis://${options.username}:${options.password}@${options.host}:${options.port}` : `redis://${options.host}:${options.port}`;

		this.client = createClient({
			url: redisUrl,
			db: options.db || 0,
			socket: {
				reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 1000, 5000)),
			}
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

client.on('reconnecting', () => {
	console.log('Redis reconnecting...');
});

client.on('end', () => {
	console.log('Redis connection closed.');
});

export default client;
