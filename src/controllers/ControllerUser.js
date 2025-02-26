import { User, Book, BookReturn, BookBorrow } from '../models/index';
import Joi from 'joi';
import Response from '../helpers/helperResponse';
import moment from 'moment';
import logger from '../helpers/logger';
import client from '../cache/redis';

export default {
	/**
	 * @description Creates a new user in the system.
	 * @route POST /users
	 * @param {object} req - The request object containing the user's data.
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

			const existingUser = await User.findOne({ where: { name } });

			if (existingUser) {
				logger.warn(`User with name ${name} already exists`);
				return Response.Conflict(res, `${name} already exists`);
			}

			await User.create({ name });

			return Response.Create(res);
		} catch (error) {
			logger.error(`Exception occurred in books/create: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Retrieves all users from the database.
	 * @route GET /users
	 * @param {object} req - The request object.
	 * @param {object} res - The response object used to return the response.
	 * @returns {array} - List of all users in the system.
	 */
	get: async (req, res) => {
		try {
			const cacheKey = 'users:list';

			const cachedUsers = await client.get(cacheKey);

			if (cachedUsers) {
				logger.info('Returning cached users data');
				return res.json(JSON.parse(cachedUsers)); // Return cached response
			}

			const users = await User.findAll();

			if (!users || users.length === 0) {
				logger.warn('No users found');
				return res.json([]);
			}

			await client.set(cacheKey, JSON.stringify(users), { EX: 180 });

			res.json(users);
		} catch (error) {
			logger.error(`Exception occurred in users/get: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Retrieves a user by their unique ID along with their borrowed and returned books.
	 * @route GET /users/:id
	 * @param {object} req - The request object containing the user's ID.
	 * @param {object} res - The response object used to return the response.
	 * @returns {object} - The user details, including currently borrowed and past returned books.
	 */
	getById: async (req, res) => {
		try {
			const { id } = req.params;

			const cacheKey = `users:${id}`;

			const cachedUser = await client.get(cacheKey);

			if (cachedUser) {
				logger.info('Returning cached user data');
				return res.json(JSON.parse(cachedUser));
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
				logger.warn(`User with ID ${id} not found`);
				return Response.NotFoundUser(res);
			}

			const currentBooks = user.BookBorrows.filter((borrow) => {
				return !borrow.BookReturns || borrow.BookReturns.length === 0;
			});

			const pastBooks = user.BookReturns.map((returnRecord) => ({
				name: returnRecord.Book.name,
				userScore: returnRecord.score,
			}));

			const presentBooks = currentBooks.map((borrow) => ({
				name: borrow.Book.name,
			}));

			const userData = {
				id: user.id,
				name: user.name,
				present: presentBooks,
				past: pastBooks,
			};

			await client.set(cacheKey, JSON.stringify(userData), { EX: 120 });

			res.json(userData);
		} catch (error) {
			logger.error(`Exception occurred in users/getById: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Allows a user to borrow a book.
	 * @route POST /users/:id/borrow/:bookId
	 * @param {object} req - The request object containing the user's ID and the book ID.
	 * @param {object} res - The response object used to return the response.
	 * @returns {object} Response - Returns a response indicating the success or failure of the borrowing action.
	 */
	borrow: async (req, res, next) => {
		try {
			const { id, bookId } = req.params;

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required().messages({
					'number.base': 'id must be a valid number',
					'number.integer': 'id must be an integer',
					'number.greater': 'id must be greater than zero',
					'any.required': 'id is required',
				}),
				bookId: Joi.number().integer().greater(0).required().messages({
					'number.base': 'bookId must be a valid number',
					'number.integer': 'bookId must be an integer',
					'number.greater': 'bookId must be greater than zero',
					'any.required': 'bookId is required',
				}),
			});

			const { error } = schema.validate({ id, bookId });

			if (error) {
				logger.warn(`Validation error: ${error.details[0].message}`);
				return Response.BadRequest(res, error.details[0].message);
			}

			const user = await User.findOne({ where: { id } });

			if (!user) {
				logger.warn(`User with ID ${id} not found`);
				return Response.NotFoundUser(res);
			}

			const book = await Book.findOne({ where: { id: bookId } });

			if (!book) {
				logger.warn(`Book with ID ${id} not found`);
				return Response.NotFoundBook(res);
			}

			const lockKey = `bookLock:${bookId}`;

			// Attempt to acquire lock
			const lock = await client.set(lockKey, 'locked', {
				NX: true,
				EX: 60,
			});

			if (lock === 'OK') {
				logger.warn(`Book with ID ${bookId} is currently locked by another user`);
				return Response.Conflict(res, 'Book is already borrowed by another user.');
			}

			const nowUtc = moment().utc().format();

			await BookBorrow.create({ bookId, userId: id, borrowedDate: nowUtc });

			//Release lock
			await client.del(lockKey);
			return Response.NoContent(res);
		} catch (error) {
			logger.error(`Exception occurred in users/borrow: ${error}`);
			Response.InternalServerError(res);
		}
	},

	/**
	 * @description Allows a user to return a borrowed book and rate it.
	 * @route POST /users/:id/return/:bookId
	 * @param {object} req - The request object containing the user's ID, book ID, and rating score.
	 * @param {object} res - The response object used to return the response.
	 * @returns {object} Response - Returns a response indicating the success or failure of the return action.
	 */
	return: async (req, res, next) => {
		try {
			const { id, bookId } = req.params;
			const { score } = req.body;

			const schema = Joi.object({
				id: Joi.number().integer().greater(0).required().messages({
					'number.base': 'id must be a valid number',
					'number.integer': 'id must be an integer',
					'number.greater': 'id must be greater than zero',
					'any.required': 'id is required',
				}),
				bookId: Joi.number().integer().greater(0).required().messages({
					'number.base': 'bookId must be a valid number',
					'number.integer': 'bookId must be an integer',
					'number.greater': 'bookId must be greater than zero',
					'any.required': 'bookId is required',
				}),
				score: Joi.number().integer().greater(0).less(10).required().messages({
					'number.base': 'score must be a valid number',
					'number.integer': 'score must be an integer',
					'number.greater': 'score must be greater than zero',
					'number.less': 'score must be less than 10',
					'any.required': 'score is required',
				}),
			});

			const { error } = schema.validate({ id, bookId, score });

			if (error) {
				logger.warn(`Validation error: ${error.details[0].message}`);
				return Response.BadRequest(res, error.details[0].message);
			}

			const user = await User.findOne({ where: { id } });

			if (!user) {
				logger.warn(`User with ID ${id} not found`);
				return Response.NotFoundUser(res);
			}

			const book = await Book.findOne({ where: { id: bookId } });

			if (!book) {
				logger.warn(`Book with ID ${id} not found`);
				return Response.NotFoundBook(res);
			}

			const nowUtc = moment().utc().format();

			await BookReturn.create({ bookId, userId: id, score, nowUtc });

			return Response.NoContent(res);
		} catch (error) {
			logger.error(`Exception occurred in users/return: ${error}`);
			Response.InternalServerError(res);
		}
	},
};
