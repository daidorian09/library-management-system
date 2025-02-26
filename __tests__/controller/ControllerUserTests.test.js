import request from 'supertest';
import { app } from '../../src/app'; 
import { User, Book, BookReturn } from '../../src/models'; 
import client from '../../src/cache/redis';

jest.mock('../../src/models');  
jest.mock('../../src/cache/redis'); 


describe('User Controller', () => {
  describe('POST /users', () => {
    it('should create a new user', async () => {

        const newUser = { name: 'test user' };
            
        User.findOne.mockResolvedValue(null);  
        User.create.mockResolvedValue(newUser); 
        
        const res = await request(app).post('/api/v1/users').send(newUser);
        
        expect(res.status).toBe(201);  
        expect(User.create).toHaveBeenCalledWith(newUser);

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({ id: 1, name: 'test user' });
    });

    it('should return conflict if user already exists', async () => {
        const existingUser = { name: 'Existing User' };

        User.findOne.mockResolvedValue(existingUser);  

        const res = await request(app).post('/api/v1/users').send(existingUser);

        expect(res.status).toBe(409);  
        expect(User.findOne).toHaveBeenCalledWith({ where: { name: existingUser.name } });
    });

    it('should return a validation error if name is missing', async () => {
        const res = await request(app).post('/api/v1/users').send({});

        expect(res.status).toBe(400);
    });

    it('should handle unexpected errors gracefully', async () => {
        const newUser = { name: 'test user' };

        User.findOne.mockRejectedValue(new Error('Database error'));
    
        const res = await request(app).post('/api/v1/users').send(newUser);
    
        expect(res.status).toBe(500);
      });
  });

  describe('GET /users', () => {
    it('should return an empty array if no users are found', async () => {
        client.get.mockResolvedValue(null); 
        
        User.findAll.mockResolvedValue([]); 
    
        const res = await request(app).get('/api/v1/users');
    
        expect(res.status).toBe(200);  
        expect(res.body).toEqual([]); 
        expect(User.findAll).toHaveBeenCalled();
      });
      
    it('should return cached users', async () => {
        const cachedUsers = JSON.stringify([{ id: 1, name: 'Cached User' }]);

        client.get.mockResolvedValue(cachedUsers);

        const res = await request(app).get('/api/v1/users');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(JSON.parse(cachedUsers));
    });

    it('should return users from database when cache is empty', async () => {

        const users = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
            
        client.get.mockResolvedValue(null);
        User.findAll.mockResolvedValue(users);  
        
        const res = await request(app).get('/api/v1/users');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(users);  
        expect(client.set).toHaveBeenCalledWith('users:list', JSON.stringify(users), { EX: 180 });  
    });

    it('should handle unexpected errors gracefully', async () => {
        User.findAll.mockRejectedValue(new Error('Database error'));
    
        const res = await request(app).get('/api/v1/users');
    
        expect(res.status).toBe(500);
      });
  });

  describe('GET /users/:id', () => {
    it('should return a validation error if id is undefined', async () => {
        const res = await request(app).get('/api/v1/users/undefined');

        expect(res.status).toBe(400);
    });

    it('should return user details from cache', async () => {
        const mockUser = {
            id: 1,
            name: 'John Doe',
            past: [
              {
                Book: { id: 101, name: 'Book A' },
                BookReturns: [],
              },
            ],
            present: [
              {
                Book: { id: 102, name: 'Book B' },
                score: 8,
              },
            ],
          };
      client.get.mockResolvedValue(JSON.stringify(mockUser));

      const res = await request(app).get('/api/v1/users/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(User.findByPk).not.toHaveBeenCalled();
    });

    it('should return user data from database if not in cache', async () => {
        const mockUser = {
            id: 1,
            name: 'John Doe',
            BookBorrows: [
                {
                    Book: { id: 102, name: 'Book B' },
                    BookReturns: [], // Currently borrowed books
                },
            ],
            BookReturns: [
                {
                    Book: { id: 101, name: 'Book A' },
                    score: 8, // Past borrowed books
                },
            ],
        };
    
        client.get.mockResolvedValue(null);
        User.findByPk.mockResolvedValue(mockUser);
    
        const res = await request(app).get('/api/v1/users/1');
    
        expect(User.findByPk).toHaveBeenCalledWith("1", expect.any(Object)); 
        
        expect(client.set).toHaveBeenCalledWith(
            'users:1',
            JSON.stringify({
                id: mockUser.id,
                name: mockUser.name,
                present: [{ name: 'Book B' }], 
                past: [{ name: 'Book A', userScore: 8 }],
            }),
            { EX: 120 }
        );
    
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            present: [{ name: 'Book B' }],
            past: [{ name: 'Book A', userScore: 8 }],
        });
    });

    it('should return 400 if user details not found', async () => {
        client.get.mockResolvedValue(null); 
        User.findByPk.mockResolvedValue(null);
    
        const res = await request(app).get('/api/v1/users/1');
    
        expect(res.status).toBe(400);  
    });

    it('should handle unexpected errors gracefully', async () => {
        client.get.mockResolvedValue(null);
        User.findByPk.mockRejectedValue(new Error('Database error'));
    
        const res = await request(app).get('/api/v1/users');
    
        expect(res.status).toBe(500);
      });
    
  });

  describe('User Controller - Return Book', () => {  
    it('should return 400 Bad Request if input validation fails', async () => {
      const res = await request(app).post('/api/v1/users/abc/return/xyz').send({ score: 15 });
  
      expect(res.status).toBe(400);
    });
  
    it('should return 400 if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);
  
      const res = await request(app).post('/api/v1/users/99/return/101').send({ score: 7 });
  
      expect(res.status).toBe(400);
    });
  
    it('should return 400 if book does not exist', async () => {
      User.findOne.mockResolvedValue({ id: 1 });
      Book.findOne.mockResolvedValue(null);
  
      const res = await request(app).post('/api/v1/users/1/return/999').send({ score: 6 });
  
      expect(res.status).toBe(400);
    });

    it('should return 204 No Content on successful return', async () => {
        const mockUser = { id: 1 };
        const mockBook = { id: 101 };
    
        User.findOne.mockResolvedValue(mockUser);
        Book.findOne.mockResolvedValue(mockBook);
        BookReturn.create.mockResolvedValue({});
    
        const res = await request(app).post('/api/v1/users/1/return/101').send({ score: 8 });
    
        expect(res.status).toBe(204);
      });
  
    it('should handle unexpected errors gracefully', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
  
      const res = await request(app).post('/api/v1/users/1/return/101').send({ score: 9 });
  
      expect(res.status).toBe(500);
    });
  });
});
