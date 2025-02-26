const message = (messages) => {
	return typeof messages === 'object' ? messages : { messages: [messages] };
};

const Response = {
	Ok: (res, msg) => res.status(200).json(message(msg || { success: true })),
	Create: (res) => res.status(201).json(),
	NoContent: (res) => res.status(204).json(),
	BadRequest: (res, msg) => res.status(400).json(message(msg || 'Bad Request')),
	NotFound: (res, msg) => res.status(404).json(message(msg || 'Not found')),
	Conflict: (res, msg) => res.status(409).json(message(msg || 'Conflict')),
	InternalServerError: (res, msg) => res.status(500).json(message(msg || 'Internal Server Error')),

	// User
	NotFoundUser: (res, msg) => res.status(400).json(message(msg || 'user not found')),

	// Book
	NotFoundBook: (res, msg) => res.status(400).json(message(msg || 'book not found')),
};

export default Response;
