import { sequelize ,User,Book, BookBorrow, BookReturn } from './models/index';

export const seed = async () => {
  try {
    // Sync models with the database (create tables if they don't exist)
    await sequelize.sync({ force: true });

    // Insert sample users
    const user1 = await User.create({ name: 'Alice' });
    const user2 = await User.create({ name: 'Bob' });

    // Insert sample books
    const book1 = await Book.create({ name: 'The Great Gatsby' });
    const book2 = await Book.create({ name: '1984' });
    const book3 = await Book.create({ name: 'The Godfather' });

    // Insert sample book borrows
    await BookBorrow.create({
      userId: user1.id,
      bookId: book1.id,
      borrowedDate: new Date(),
    });
    await BookBorrow.create({
      userId: user2.id,
      bookId: book2.id,
      borrowedDate: new Date(),
    });
    await BookBorrow.create({
        userId: user2.id,
        bookId: book3.id,
        borrowedDate: new Date(),
    });

    // Insert sample book returns
    await BookReturn.create({
      userId: user1.id,
      bookId: book1.id,
      score: 5,
    });
    await BookReturn.create({
      userId: user2.id,
      bookId: book2.id,
      score: 4,
    });
    await BookReturn.create({
        userId: user2.id,
        bookId: book3.id,
        score: 7,
      });

    console.log('Seeder ran successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
};
