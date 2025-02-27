import Sequelize from 'sequelize';
import ModelUser from './ModelUser';
import ModelBook from './ModelBook';
import BookBorrowModel from './ModelBookBorrow';
import BookReturnModel from './ModelBookReturn';
import config from '../config';
import logger from '../helpers/logger';

// Set up Sequelize connection
const sequelize = new Sequelize({
	dialect: config.database.dialect,
	host: config.database.host,
	username: config.database.username,
	password: config.database.password,
	database: config.database.name,
	pool: {
		max: 10, // Max number of connections in the pool
		min: 0, // Min number of connections in the pool
		acquire: 30000, // Max time (in ms) to wait for a connection
		idle: 10000, // Max time (in ms) a connection can be idle before being released
	},
	logging: false,
});


// Initialize models
const User = ModelUser(sequelize);
const Book = ModelBook(sequelize);
const BookBorrow = BookBorrowModel(sequelize);
const BookReturn = BookReturnModel(sequelize);

// Establish relationships
User.associate({ BookBorrow, BookReturn });
Book.associate({ BookBorrow, BookReturn });
BookBorrow.associate({ User, Book });
BookReturn.associate({ User, Book });

// Function to test DB connection
async function testConnection() {
	try {
		await sequelize.authenticate();
		logger.info('Database connection established successfully.');
	} catch (error) {
		logger.error('Unable to connect to the database:', error);
		process.exit(1); // Exit the app if DB connection fails
	}
}

// Call the test connection function to verify setup
testConnection();

// Export models
export { sequelize, User, Book, BookBorrow, BookReturn };
