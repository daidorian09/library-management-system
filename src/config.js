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
};
