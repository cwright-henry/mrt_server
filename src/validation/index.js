const Joi = require('joi')

// Boolean

const BOOLEAN = Joi.boolean();

// Strings
const STRING = Joi.string();
const EMAIL = Joi.string().email();
const ASSETCLASS = Joi.string().valid(['Library', 'Equity', 'Index', 'Cmdty', 'Curncy', 'Crypto'])
const PASSWORD = Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$'));
const PROC_TYPE = Joi.string().valid(['OU', 'hypOU']);
const ALPHA_NUM = Joi.string().alphanum();

// Numbers
const NUM = Joi.number();
const NUM_POS = Joi.number().positive();
const NUM_INT = Joi.number().positive();

// Arrays
const POINT = Joi.array().items(Joi.number().required(), Joi.number().required()).single();
const TIMESERIES = Joi.array().items(POINT);

const textTickerSchema = {
	query: Joi.object().keys({
		curr_id: NUM_POS.required()
	})
}

const createTickerSchema = {
	body: Joi.object().keys({
		name: ALPHA_NUM.required(),
		curr_id: NUM_POS.required(),
		type: ASSETCLASS.required()
	})
}

const updateUserSchema = {
	body: Joi.object().keys({
		userId: ALPHA_NUM.required(),
		status: BOOLEAN.required(),
		firstName: STRING.max(128).required(),
		lastName: STRING.max(128).required(),
		companyName: STRING.max(128).required(),
		email: EMAIL.max(256).required()
	})
}

const newUserSchema = {
	body: Joi.object().keys({
		firstName: STRING.max(128).required(),
		lastName: STRING.max(128).required(),
		companyName: STRING.max(128).required(),
		email: EMAIL.max(256).required(),
		password: PASSWORD.max(32).required()
	})
}

const searchUsersSchema = {
	query: Joi.object().keys({
		offset: NUM_INT.required(),
		limit: NUM_POS.required(),
		search: ALPHA_NUM.allow(null).optional()
	})
}

const userHistorySchema = {
	query: Joi.object().keys({
		offset: NUM_INT.required(),
		limit: NUM_POS.required(),
		userId: ALPHA_NUM.allow(null).optional()
	})
}

const userFindSchema = {
	query: Joi.object().keys({
		userId: ALPHA_NUM.required()
	})
}

const userRemoveSchema = {
	body: Joi.object().keys({
		userId: ALPHA_NUM.required()
	})
}

const tickerRemoveSchema = {
	body: Joi.object().keys({
		tickerId: ALPHA_NUM.required()
	})
}

const setPasswordSchema = {
	body: Joi.object().keys({
		userId: ALPHA_NUM.required(),
		newPassword: PASSWORD.max(32).required()
	})
}

const upatePasswordSchema = {
	body: Joi.object().keys({
		oldPassword: PASSWORD.max(32).required(),
		newPassword: PASSWORD.max(32).required()
	})
}

const getFitLSESchema = {
	body: Joi.object().keys({
		ts1: TIMESERIES.required(),
		ts2: TIMESERIES.required()
	})
}

const loginSchema = {
	body: Joi.object().keys({
		email: EMAIL.max(256).required(),
		password: PASSWORD.max(32).required()
	})
}

const registerSchema = {
	body: Joi.object().keys({
		firstname: STRING.max(128).required(),
		lastname: STRING.max(128).required(),
		email: EMAIL.max(256).required(),
		password: PASSWORD.max(32).required()
	})
}

const getAllSchema = {
	query: Joi.object().keys({
		proctype: PROC_TYPE.required(),
		kappa: NUM.required(),
		sigma: NUM.required(),
		theta: NUM.required(),
		nbeta: NUM.allow(null).optional(),
		carry: NUM.allow(null).optional(),
		x_0: NUM.allow(null).optional(),
		trans_oneway_stdev: NUM.allow(null).optional(),
	})
}

const getFitSchema = {
	query: Joi.object().keys({
		proctype: PROC_TYPE.required(),
		kappa: NUM.allow(null).optional(),
		sigma: NUM.allow(null).optional(),
		theta: NUM.allow(null).optional(),
		nbeta: NUM.allow(null).optional(),
		strategyId: ALPHA_NUM.required(),
		start_date: NUM.required(),
		end_date: NUM.required()
	})
}

const getScenariosSchema = {
	query: Joi.object().keys({
		proctype: PROC_TYPE.required(),
		kappa: NUM.required(),
		sigma: NUM.required(),
		theta: NUM.required(),
		nbeta: NUM.allow(null).optional(),
		x_0: NUM.required(),
		x_0_date: NUM_POS.required(),
		nsteps: NUM_POS.required(),
		seed: NUM_POS.required()
	})
}

const getTimeseries = {
	query: Joi.object().keys({
		assetClass: ASSETCLASS.required(),
		ticker: ALPHA_NUM.required(),
	})
}

/**
 * Generic request validation. Converted parameters are aaded to the request object
 * as validated.
 * 
 * @param {JOI.any} requestSchema Schema defined for request type
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const validateRequest = (requestSchema, req, res, next) => {
	const validations = ['headers', 'params', 'query', 'body']
		.map(key => {
			const schema = requestSchema[key];
			const value = req[key];
			const validate = () => schema ? schema.validate(value, { abortEarly: false }) : Promise.resolve({});
			return validate().then(result => ({ [key]: result }));
		});
	return Promise.all(validations)
		.then(result => {
			req.validated = Object.assign({}, ...result);
			next();
		})
		.catch(validationError => {
			const message = validationError.details.map(d => ({ msg: d.message, field: d.context.key }));
			const error = new Error()
			error.statusCode = 400;
			error.message = message
			next(error);
		});
};

module.exports = {
	getScenarios: (req, res, next) => validateRequest(getScenariosSchema, req, res, next),
	getFit: (req, res, next) => validateRequest(getFitSchema, req, res, next),
	getFitLSE: (req, res, next) => validateRequest(getFitLSESchema, req, res, next),
	getAllSchema: (req, res, next) => validateRequest(getAllSchema, req, res, next),
	getTimeseries: (req, res, next) => validateRequest(getTimeseries, req, res, next),
	upatePassword: (req, res, next) => validateRequest(upatePasswordSchema, req, res, next),
	login: (req, res, next) => validateRequest(loginSchema, req, res, next),
	register: (req, res, next) => validateRequest(registerSchema, req, res, next),
	searchUsers: (req, res, next) => validateRequest(searchUsersSchema, req, res, next),
	userHistory: (req, res, next) => validateRequest(userHistorySchema, req, res, next),
	userFind: (req, res, next) => validateRequest(userFindSchema, req, res, next),
	setPassword: (req, res, next) => validateRequest(setPasswordSchema, req, res, next),
	newUser: (req, res, next) => validateRequest(newUserSchema, req, res, next),
	updateUser: (req, res, next) => validateRequest(updateUserSchema, req, res, next),
	createTicker: (req, res, next) => validateRequest(createTickerSchema, req, res, next),
	userRemove: (req, res, next) => validateRequest(userRemoveSchema, req, res, next),
	tickerRemove: (req, res, next) => validateRequest(tickerRemoveSchema, req, res, next),
	textTicker: (req, res, next) => validateRequest(textTickerSchema, req, res, next)
}