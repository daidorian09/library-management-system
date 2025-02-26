import { Sequelize } from 'sequelize';

export default (sequelize) => {
	const BookBorrow = sequelize.define(
		'BookBorrow',
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
			borrowedDate: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		},
		{
			timestamps: false, // Disable automatic timestamp handling
		}
	);

	BookBorrow.associate = (models) => {
		BookBorrow.belongsTo(models.User, { foreignKey: 'userId' });
		BookBorrow.belongsTo(models.Book, { foreignKey: 'bookId' });
	};

	return BookBorrow;
};
