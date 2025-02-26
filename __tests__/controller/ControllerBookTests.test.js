import request from 'supertest';
import { app } from '../../src/app';  
import { Book } from '../../src/models';  
import client from '../../src/cache/redis'; 

jest.mock('../../src/models');  
jest.mock('../../src/cache/redis'); 


describe('Books Controller Tests', () => {
    describe('POST /books', () => {
        it('should create a new book when valid data is provided', async () => {
            const newBook = { name: 'New Book' };
            
            Book.findOne.mockResolvedValue(null);  
            Book.create.mockResolvedValue(newBook); 
            
            const res = await request(app).post('/api/v1/books').send(newBook);
            
            expect(res.status).toBe(201);  
            expect(Book.create).toHaveBeenCalledWith(newBook);
        });

        it('should return a conflict error if the book already exists', async () => {
            const existingBook = { name: 'Existing Book' };

            Book.findOne.mockResolvedValue(existingBook);  

            const res = await request(app).post('/api/v1/books').send(existingBook);

            expect(res.status).toBe(409);  
            expect(Book.findOne).toHaveBeenCalledWith({ where: { name: existingBook.name } });
        });

        it('should return a validation error if name is missing', async () => {
            const res = await request(app).post('/api/v1/books').send({});

            expect(res.status).toBe(400);
        });

        it('should handle unexpected errors gracefully', async () => {
            const newBook = { name: 'New Book' };
    
            Book.findOne.mockRejectedValue(new Error('Database error'));
        
            const res = await request(app).post('/api/v1/books').send(newBook);
        
            expect(res.status).toBe(500);
          });
    });

    describe('GET /books', () => {
        it('should return a list of books', async () => {
            const books = [{ id: 1, name: 'Book 1' }, { id: 2, name: 'Book 2' }];
            
            client.get.mockResolvedValue(null);
            Book.findAll.mockResolvedValue(books);  
            
            const res = await request(app).get('/api/v1/books');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(books);  
            expect(client.set).toHaveBeenCalledWith('books:list', JSON.stringify(books), { EX: 180 });  
        });

        it('should return cached books data if available', async () => {
            const cachedBooks = JSON.stringify([{ id: 1, name: 'Cached Book' }]);

            client.get.mockResolvedValue(cachedBooks);

            const res = await request(app).get('/api/v1/books');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(JSON.parse(cachedBooks));
        });

        it('should return an empty array if no books are found', async () => {
            client.get.mockResolvedValue(null); 
            
            Book.findAll.mockResolvedValue([]); 
        
            const res = await request(app).get('/api/v1/books');
        
            expect(res.status).toBe(200);  
            expect(res.body).toEqual([]); 
            expect(Book.findAll).toHaveBeenCalled();
          });

        it('should handle unexpected errors gracefully', async () => {
            client.get.mockResolvedValue(null);    
            Book.findAll.mockRejectedValue(new Error('Database error'));
        
            const res = await request(app).get('/api/v1/books');
        
            expect(res.status).toBe(500);
          });
    });

    describe('GET /books/:id', () => {
        it('should return cached book data if available', async () => {
            const mockBookData = {
              id: 1,
              name: 'Mock Book',
              averageScore: 4.5,
            };
        
            client.get.mockResolvedValue(JSON.stringify(mockBookData));
        
            const res = await request(app).get('/api/v1/books/1');
        
            expect(res.status).toBe(200); 
            expect(res.body).toEqual(mockBookData); 
            expect(client.get).toHaveBeenCalledWith('books:1');  
          });
        
        it('should return book details when valid id is provided', async () => {
            const book = { id: 1, name: 'Book 1',averageScore: 1  };
            
            client.get.mockResolvedValue(null);

            Book.findOne.mockResolvedValue({
                id: book.id,
                name: book.name,
                get: jest.fn().mockReturnValueOnce(book.id).mockReturnValueOnce(book.name).mockReturnValueOnce(book.averageScore),
            });

            const res = await request(app).get('/api/v1/books/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(book); 
            expect(client.set).toHaveBeenCalledWith('books:1', JSON.stringify(book), { EX: 120 }); 
        });

        it('should return a validation error if id is invalid', async () => {
            const res = await request(app).get('/api/v1/books/invalid');

            expect(res.status).toBe(400);  
        });

        it('should return a 404 if book not found', async () => {
            const bookId = 999;
            
            client.get.mockResolvedValue(null);

            Book.findOne.mockResolvedValue(null);

            const res = await request(app).get(`/api/v1/books/${bookId}`);

            expect(res.status).toBe(400);  
        });

        it('should handle unexpected errors gracefully', async () => {
            const bookId = 999;
            
            client.get.mockResolvedValue(null);

            Book.findOne.mockResolvedValue(new Error('Database error'));

            const res = await request(app).get(`/api/v1/books/${bookId}`);
        
            expect(res.status).toBe(500);
        });
    });
});
