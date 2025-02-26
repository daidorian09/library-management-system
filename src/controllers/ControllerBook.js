import Joi from 'joi';
import { Book, BookReturn } from '../models/index';
import Response from '../helpers/helperResponse';
import { Sequelize } from 'sequelize';
import logger from '../helpers/logger';
import client from '../cache/redis';

export default {
	/**
	 * @description Creates a new book in the system.
	 * @route POST /books
	 * @param {object} req - The request object containing the book's data.
	 * @param {object} res - The response object used to return the response.
	 * @param {function} next - The next middleware function.
	 * @returns {object} Response - Returns a response indicating the success or failure of the operation.
	 */
	create: async (req, res, next) => {
		try {
			const { name } = req.body;
			const schema = Joi.object({
				name: Joi.string().min(1).required().messages({
					'string.base': 'name must be a valid string',
					'string.empty': 'name cannot be empty',
					'any.required': 'name is required',
				}),
			});

			const { error } = schema.validate({ name });

			if (error) {
				logger.warn(`Validation error: ${error.details[0].message}`);
				return Response.BadRequest(res, error.details[0].message);
			}

			const existingBook = await Book.findOne({ where: { name } });

			if (existingBook) {
				logger.warn(`Book with name ${name} already exists`);
				return Response.Conflict(res, `${name} already exists`);
			}

			await Book.create({ name });

			return Response.Create(res);
		} catch (error) {
			logger.error(`Exception occurred in books/create: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Retrieves all books from the database.
	 * @route GET /books
	 * @param {object} req - The request object.
	 * @param {object} res - The response object used to return the response.
	 * @returns {array} - List of all books in the system.
	 */
	get: async (req, res) => {
		try {
			const cacheKey = 'books:list';

			const cachedBooks = await client.get(cacheKey);

			if (cachedBooks) {
				logger.info('Returning cached books data');
				return res.json(JSON.parse(cachedBooks));
			}

			const books = await Book.findAll();
			if (!books) {
				logger.info('No books found');
				res.json([]);
			}

			await client.set(cacheKey, JSON.stringify(books), { EX: 180 });

			res.json(books);
		} catch (error) {
			logger.error(`Exception occurred in books/get: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Retrieves a book by its unique ID, including its average rating score.
	 * @route GET /books/:id
	 * @param {object} req - The request object containing the book's ID.
	 * @param {object} res - The response object used to return the response.
	 * @returns {object} - The book details, including its average rating score.
	 */
	getById: async (req, res) => {
		try {
			const { id } = req.params;

			const cacheKey = `books:${id}`;

			const cachedBook = await client.get(cacheKey);

			if (cachedBook) {
				logger.info('Returning cached book data');
				return res.json(JSON.parse(cachedBook));
			}

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required().messages({
					'number.base': 'id must be a valid number',
					'number.integer': 'id must be an integer',
					'number.greater': 'id must be greater than zero',
					'any.required': 'id is required',
				}),
			});

			const { error } = schema.validate({ id });

			if (error) {
				logger.warn(`Validation error: ${error.details[0].message}`);
				return Response.BadRequest(res, error.details[0].message);
			}

			const book = await Book.findOne({
				where: { id },
				attributes: ['id', 'name', [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('BookReturns.score')), 0), 'averageScore']],
				include: [
					{
						model: BookReturn,
						attributes: [],
					},
				],
				group: ['Book.id'],
			});

			if (!book) {
				logger.warn(`Book with ID ${id} not found`);
				return Response.NotFoundBook(res);
			}

			let averageScore = parseFloat(book.get('averageScore'));
			averageScore = isNaN(averageScore) || averageScore === 0 ? -1 : parseFloat(averageScore.toFixed(2));

			const bookData = {
				id: book.id,
				name: book.name,
				averageScore,
			};

			await client.set(cacheKey, JSON.stringify(bookData), { EX: 120 });

			res.json(bookData);
		} catch (error) {
			logger.error(`Exception occurred in books/getById: ${error}`);
			Response.InternalServerError(res);
		}
	},
};
