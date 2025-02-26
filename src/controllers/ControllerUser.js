import { User, Book, BookReturn, BookBorrow } from '../models/index';
import Joi from 'joi'; 
import Response  from '../helpers/helperResponse';
import moment from 'moment'

export default {
	create: async (req, res, next) => {
		try {
			const { name } = req.body;

			const schema = Joi.object({
			name: Joi.string().min(1).required()
			  .messages({
				'string.base': 'name must be a valid string',
				'string.empty': 'name cannot be empty',
				'any.required': 'name is required',
			  }),
		  	});
	  
			const { error } = schema.validate({ name });

		 	if (error) {
				return Response.BadRequest(res, error.details[0].message);
			}

			const existingUser = await User.findOne({ where: { name } });

			if (existingUser) {
		 	 	return Response.Conflict(res, `${name} already exists`);
			}

			await User.create({ name });

			return Response.Create(res);
		} catch (error) {
			console.error("exception occurred in users/create", error)
			Response.InternalServerError(res)
		}
	},
	
	get: async (req, res) => {
		try {
			const users = await User.findAll()
			if (!users) {
				res.json([]);
			}
		res.json(users);
		} catch (error) {
			console.error("exception occurred in users/get", error)
			Response.InternalServerError(res)
		}
	},

	getById: async (req, res) => {
		try {
			const { id } = req.params;

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required()
			  	.messages({
				'number.base': 'id must be a valid number',
				'number.integer': 'id must be an integer',
				'number.greater': 'id must be greater than zero',
				'any.required': 'id is required',
			  }),
		  	});

			const { error } = schema.validate({ id });

 			if (error) {
				return Response.BadRequest(res, error.details[0].message);
			}

			  const user = await User.findByPk(id, {
				include: [
				  {
					model: BookBorrow,
					include: [
					  {
						model: Book,
						attributes: ['id', 'name'],
					  },
					],
				  },
				  {
					model: BookReturn,
					include: [
					  {
						model: Book,
						attributes: ['id', 'name'],
					  },
					],
				  },
				],
			  });
		  
			  if (!user) {
				return res.status(404).json({ message: 'User not found' });
			  }

			  console.log(user)
		  
			  // Get current borrowed books (those which are not returned yet)
			const currentBooks = user.BookBorrows.filter((borrow) => {
				return !borrow.BookReturns || borrow.BookReturns.length === 0; // Book has not been returned yet
			});
		  
			  const pastBooks = user.BookReturns.map((returnRecord) => ({
				name: returnRecord.Book.name,
				userScore: returnRecord.score,  
			  }));
		  
			  const presentBooks = currentBooks.map((borrow) => ({
				name: borrow.Book.name
			  }));


			  return res.json({
				id : user.id,
				name : user.name,
				present: presentBooks,
				past: pastBooks,
			  });
		} catch (error) {
			console.error("exception occurred in books/getById", error)
			Response.InternalServerError(res)
		}
	},

	borrow: async (req, res, next) => {
		try {
			const { id, bookId } = req.params;
	
			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required()
			  	.messages({
					'number.base': 'id must be a valid number',
					'number.integer': 'id must be an integer',
					'number.greater': 'id must be greater than zero',
					'any.required': 'id is required',
			  }),
			  bookId: Joi.number().integer().greater(0).required()
			  	.messages({
					'number.base': 'bookId must be a valid number',
					'number.integer': 'bookId must be an integer',
					'number.greater': 'bookId must be greater than zero',
					'any.required': 'bookId is required',
			  })
		  	});

			const { error } = schema.validate({ id, bookId });

 			if (error) {
				return Response.BadRequest(res, error.details[0].message);
			}

			const user = await User.findOne({ where: { id } });

			if (!user) {
		 	 	return Response.NotFoundUser(res);
			}

			const book = await Book.findOne({ where: { id:bookId } });

			if (!book) {
		 	 	return Response.NotFoundBook(res);
			}

			const nowUtc = moment().utc().format();

			await BookBorrow.create({ bookId, userId : id, borrowedDate: nowUtc});

			return Response.NoContent(res);
		} catch (error) {
			console.error("exception occurred in users/return", error)
			Response.InternalServerError(res)
		}
	},

	return: async (req, res, next) => {
		try {
			const { id, bookId } = req.params;
			const { score } = req.body;

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required()
			  	.messages({
					'number.base': 'id must be a valid number',
					'number.integer': 'id must be an integer',
					'number.greater': 'id must be greater than zero',
					'any.required': 'id is required',
			  }),
			  bookId: Joi.number().integer().greater(0).required()
			  	.messages({
					'number.base': 'bookId must be a valid number',
					'number.integer': 'bookId must be an integer',
					'number.greater': 'bookId must be greater than zero',
					'any.required': 'bookId is required',
			  }),
			  score: Joi.number().integer().greater(0).less(10).required()
  				.messages({
    				'number.base': 'score must be a valid number',
    				'number.integer': 'score must be an integer',
   					'number.greater': 'score must be greater than zero',
    				'number.less': 'score must be less than 10',
    				'any.required': 'score is required',
  				}),
		  	});

			const { error } = schema.validate({ id, bookId, score });

 			if (error) {
				return Response.BadRequest(res, error.details[0].message);
			}


			const user = await User.findOne({ where: { id } });

			if (!user) {
		 	 	return Response.NotFoundUser(res);
			}

			const book = await Book.findOne({ where: { id:bookId } });

			if (!book) {
		 	 	return Response.NotFoundBook(res);
			}

			const nowUtc = moment().utc().format();

			await BookReturn.create({ bookId, userId : id, score, nowUtc });

			return Response.NoContent(res);
		} catch (error) {
			console.error("exception occurred in users/return", error)
			Response.InternalServerError(res)
		}
	},
};
