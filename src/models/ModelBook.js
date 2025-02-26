import { Sequelize } from 'sequelize';

export default (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return Number(this.getDataValue('id'));  // Ensure the id is a number when retrieved
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    }
    },{
	timestamps: false, // Disable automatic timestamp handling
  });

  Book.associate = (models) => {
    // A book can be borrowed many times
    Book.hasMany(models.BookBorrow, { foreignKey: 'bookId' });
    // A book can be returned many times
    Book.hasMany(models.BookReturn, { foreignKey: 'bookId' });
  };

  return Book;
};
