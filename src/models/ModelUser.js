import { Sequelize } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
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

  User.associate = (models) => {
    // A user can borrow many books
    User.hasMany(models.BookBorrow, { foreignKey: 'userId' });
    // A user can return many books
    User.hasMany(models.BookReturn, { foreignKey: 'userId' });
  };

  return User;
};