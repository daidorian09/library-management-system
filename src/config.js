import dotenv from 'dotenv';
const { config } = dotenv;
config();

export default {
	server: {
		host: process.env.HOST || '0.0.0.0',
		port: process.env.PORT || 3030,
		prefix: '/api/v1',
	},
	database: {
		name: process.env.DATABASE || 'libraryDb',
		username: process.env.DB_USERNAME || 'docker',
		password: process.env.DB_PASSWORD || 'dockerf',
		host: process.env.DB_HOST || 'localhost',
		dialect: process.env.DB_DIALECT || 'postgres',
		environment: process.env.ENVIRONMENT || 'dev',
	},
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || 6379,
		username: process.env.REDIS_USERNAME || 'redisuser',
		password: process.env.REDIS_PASSWORD || 'redispass',
		db: process.env.REDIS_DB || 0,
		environment: process.env.ENVIRONMENT || 'dev',
	},
};
