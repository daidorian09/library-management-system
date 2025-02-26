import Joi from 'joi'; 
import { Book, BookReturn } from '../models/index';
import Response from '../helpers/helperResponse';
import { Sequelize } from 'sequelize';

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

			const existingBook = await Book.findOne({ where: { name } });

			if (existingBook) {
		 	 	return Response.Conflict(res, `${name} already exists`);
			}

			await Book.create({ name });

			return Response.Create(res);
		} catch (error) {
			console.error("exception occurred in books/create", error)
			Response.InternalServerError(res)
		}
	},

	get: async (req, res) => {
		try {
			const books = await Book.findAll()
			if (!books) {
				res.json([]);
			}
		res.json(books);
		} catch (error) {
			console.error("exception occurred in books/get", error)
			Response.InternalServerError(res)
		}
	},

	getById: async (req, res) => {
		try {
			const { id } = req.params;

			const idNumber = parseInt(id, 10);

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required()
			  	.messages({
				'number.base': 'id must be a valid number',
				'number.integer': 'id must be an integer',
				'number.greater': 'id must be greater than zero',
				'any.required': 'id is required',
			  }),
		  	});

			const { error } = schema.validate({ id: idNumber });

 			if (error) {
				return Response.BadRequest(res, error.details[0].message);
			}

			const book = await Book.findOne({
				where: { id },
				attributes: [
				  'id',
				  'name',
				  [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('BookReturns.score')), 0), 'averageScore']
				],
				include: [
				  {
					model: BookReturn,
					attributes: []
				  }
				],
				group: ['Book.id'],
			  })
			  			 
			  let averageScore = parseFloat(book.get('averageScore'));
			  averageScore = (isNaN(averageScore) || averageScore === 0) ? -1 : parseFloat(averageScore.toFixed(2));

			  res.json({
				id: book.id,
				name: book.name,
				averageScore,
			  });
		} catch (error) {
			console.error("exception occurred in books/getById", error)
			Response.InternalServerError(res)
		}
	}
};
