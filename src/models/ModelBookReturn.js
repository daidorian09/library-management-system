import { Sequelize } from 'sequelize';

export default (sequelize) => {
	const BookReturn = sequelize.define(
		'BookReturn',
		{
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				get() {
					return Number(this.getDataValue('id')); // Ensure the id is a number when retrieved
				},
			},
			bookId: {
				type: Sequelize.BIGINT,
				references: {
					model: 'Books', // Refers to the `Books` table
					key: 'id',
				},
			},
			userId: {
				type: Sequelize.BIGINT,
				references: {
					model: 'Users', // Refers to the `Users` table
					key: 'id',
				},
			},
			score: {
				type: Sequelize.INTEGER,
			},
			returnDate: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW, // Automatically set the current date and time
			},
		},
		{
			timestamps: false, // Disable automatic timestamp handling
		}
	);

	BookReturn.associate = (models) => {
		// A BookReturn entry belongs to a User and a Book
		BookReturn.belongsTo(models.User, { foreignKey: 'userId' });
		BookReturn.belongsTo(models.Book, { foreignKey: 'bookId' });
	};

	return BookReturn;
};
