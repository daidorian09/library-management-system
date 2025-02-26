# Library Management System

## 📌 Overview
This is a **Library Management System** built with **Node.js, Express.js, Babel (ES6), PostgreSQL, and Sequelize**. The application allows library members to borrow and return books, manage users, and retrieve book information efficiently.

## 🚀 Features
- **User Management**
  - List all users
  - Get user details (including borrowed books and user scores)
  - Create a new user

- **Book Management**
  - List all books
  - View book details (name & average rating)
  - Add a new book
  - Borrow a book
  - Return a book with a rating

## 🛠️ Tech Stack
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework for building APIs
- **Babel** - Enables ES6+ support
- **PostgreSQL** - Relational database for data storage
- **Sequelize** - ORM for database management

## 🏗️ Setup & Installation
### 1️⃣ Unzip the project
```sh
git clone https://github.com/daidorian09/library-management-system.git
cd library-management-system
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Configure a `.config.js` file in the root directory and add the following:
```server: {
		host: process.env.HOST || '',
		port: process.env.PORT || 3030,
		prefix: '/api/v1',
	},
	database: 'libraryDb',
	username: 'docker',
	password: 'dockerf',
	host: 'localhost',
	dialect: 'postgres',
```

### 4️⃣ Run Database Migrations
```sh
npx sequelize db:migrate
```

### 5️⃣ Start the Application
```sh
npm run dev
```

## 🔗 API Endpoints
| Method | Endpoint                  | Description                        |
|--------|-------------------------  |------------------------------------|
| GET    | /users                    | List all users                     |
| GET    | /users/:id                | Get user details                   |
| POST   | /users                    | Create a new user                  |
| GET    | /books                    | List all books                     |
| GET    | /books/:id                | Get book details                   |
| POST   | /books                    | Add a new book                     |
| POST   | /books/:id/borrow/bookId  | Borrow a book                      |
| POST   | /books/:id/return/bookId  | Return a book and give a rating    |

## 🏗️ Development
- Use building app `npm run build` for compiling
- Use `npm run dev` for development mode