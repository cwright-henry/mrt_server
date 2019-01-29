const Joi = require('joi')

const strategyId = Joi.string().alphanum();
const proctype = Joi.string().valid(['OU', 'hypOU'])
const kappa = Joi.number();
const sigma = Joi.number();
const theta = Joi.number();
const nbeta = Joi.number();
const x_0 = Joi.number();
const x_0_date = Joi.number().positive();
const nsteps =  Joi.number().positive();
const seed =  Joi.number().positive();
const point = Joi.array().items(Joi.number().required(), Joi.number().required()).single();
const timeseries = Joi.array().items(point)

const getFitLSESchema = {
	body: Joi.object().keys({
		ts1: timeseries.required(),
		ts2: timeseries.required()
	})
}

const getFitSchema = {
	query: Joi.object().keys({
		proctype: proctype.required(),
		kappa: kappa.allow(null).optional(),
		sigma: sigma.allow(null).optional(),
		theta: theta.allow(null).optional(),
		nbeta: nbeta.allow(null).optional(),
		strategyId: strategyId.required(),
		start_date: Joi.number().required(),
		end_date: Joi.number().required()
	})
}

const getScenariosSchema = {
	query: Joi.object().keys({
		proctype: proctype.required(),
		kappa: kappa.required(),
		sigma: sigma.required(),
		theta: theta.required(),
		nbeta: nbeta.allow(null).optional(),
		x_0: x_0.required(),
		x_0_date: x_0_date.required(),
		nsteps: nsteps.required(),
		seed: seed.required()
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
			const validate = () => schema ? schema.validate(value, {abortEarly: false}) : Promise.resolve({});
			return validate().then(result => ({[key]: result}));
		});
	return Promise.all(validations)
		.then(result => {
			req.validated = Object.assign({},...result);
			next();
		})
		.catch(validationError => {
			const message = validationError.details.map(d => d.message);
			const error = new Error()
			error.statusCode = 400;
			error.message = message
			next(error);
		});
};

module.exports = {
	getScenarios: (req, res,next) => validateRequest(getScenariosSchema, req, res, next),
	getFit: (req, res,next) => validateRequest(getFitSchema, req, res, next),
	getFitLSE: (req, res,next) => validateRequest(getFitLSESchema, req, res, next)
}