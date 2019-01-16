const Joi = require('joi')

const kappa = Joi.number();
const sigma = Joi.number();
const theta = Joi.number();
const x_0 = Joi.number();
const x_0_date = Joi.number().positive();
const nsteps =  Joi.number().positive();
const seed =  Joi.number().positive();

const getScenariosSchema = {
	query: Joi.object().keys({
		kappa: kappa.required(),
		sigma: sigma.required(),
		theta: theta.required(),
		x_0: x_0.required(),
		x_0_date: x_0_date.required(),
		nsteps: nsteps.required(),
		seed: seed.required()
	})
}

const validateRequest = (requestSchema, req, res, next) => {
	const validations = ['headers', 'params', 'query', 'body']
		.map(key => {
			const schema = requestSchema[key];
			const value = req[key];
			const validate = () => schema ? schema.validate(value) : Promise.resolve({});
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
	getScenarios: (req, res,next) => validateRequest(getScenariosSchema, req, res, next)
}