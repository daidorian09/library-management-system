# Library Management System

## 📌 Overview
This is a **Library Management System** built with **Node.js, Express.js, Babel (ES6), PostgreSQL, Redis and Sequelize**. The application allows library members to borrow and return books, manage users, and retrieve book information efficiently.

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
- **Redis** - Distributed Caching
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

### 4️⃣Start the Application
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


## 🐳 Docker Support
1. To run the application with Docker, follow these steps:

   Build and start the Docker containers

	```sh 
	docker-compose up --build
	```

2. Configuration for Docker
The docker-compose.yml file contains the necessary configuration to set up the application, Redis, and PostgreSQL services. **seed** will fiil the database automatically
```sh 
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3030:3030"
    environment:
      - HOST=0.0.0.0
      - PORT=3030
      - DATABASE=libraryDb
      - USERNAME=docker
      - PASSWORD=dockerf
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=docker
      - DB_PASSWORD=dockerf
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_USERNAME=redisuser
      - REDIS_DB=0
      - ENVIRONMENT=stage
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5

  postgres:
    image: postgres:alpine
    environment:
      POSTGRES_DB: libraryDb
      POSTGRES_USER: docker
      POSTGRES_PASSWORD: dockerf
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U docker"]
      interval: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

##  🧪 Testing with Supertest
Supertest is used for API testing. Below are the instructions to run tests with coverage.
```sh 
npm run test
```

## 🏗️ Development
- Use building app `npm run build` for compiling
- Use `npm run dev` for development mode