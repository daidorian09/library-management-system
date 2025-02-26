-- Create Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL
);

-- Create Books Table
CREATE TABLE IF NOT EXISTS "Books" (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL
);

-- Create BookBorrows Table
CREATE TABLE IF NOT EXISTS "BookBorrows" (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    userId BIGINT NOT NULL,
    bookId BIGINT NOT NULL,
    borrowedDate TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES "Users"(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES "Books"(id) ON DELETE CASCADE
);

-- Create BookReturns Table
CREATE TABLE IF NOT EXISTS "BookReturns" (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    userId BIGINT NOT NULL,
    bookId BIGINT NOT NULL,
	score INTEGER,
    returnDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES "Users"(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES "Books"(id) ON DELETE CASCADE
);

-- Optionally: Indexes for faster searching (especially on foreign keys)
CREATE INDEX IF NOT EXISTS idx_user_id ON "BookBorrows"(userId);
CREATE INDEX IF NOT EXISTS idx_book_id ON "BookBorrows"(bookId);
CREATE INDEX IF NOT EXISTS idx_user_id_return ON "BookReturns"(userId);
CREATE INDEX IF NOT EXISTS idx_book_id_return ON "BookReturns"(bookId);