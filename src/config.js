import dotenv from 'dotenv';
const { config } = dotenv;
config();

export default {
	server: {
		host: process.env.HOST || '',
		port: process.env.PORT || 3030,
		prefix: '/api/v1',
	},
	database: 'libraryDb',
	username: 'docker',
	password: 'dockerf',
	host: 'localhost',
	dialect: 'postgres',
	redis: {
		host: 'localhost', // Redis server address
		port: 6379, // Redis server port
		username: 'redisuser', // Redis username (if using Redis 6 or above with ACL)
		password: 'redispass', // Redis password (if configured)
		db: 0, // Optional: default database (optional)
	},
};
