import Sequelize from 'sequelize';
import ModelUser from './ModelUser';
import ModelBook from './ModelBook';
import BookBorrowModel from './ModelBookBorrow';
import BookReturnModel from './ModelBookReturn';
import config from '../config';

// Set up Sequelize connection
const sequelize = new Sequelize({
  dialect: config.dialect, 
  host: config.host,
  username: config.username, 
  password: config.password, 
  database: config.database, 
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

// Export models
export { sequelize, User, Book, BookBorrow, BookReturn };
