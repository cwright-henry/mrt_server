const AuthenticationController = require('../controllers/AuthenticationController')
const ApiController = require('../controllers/ApiController')
const MRTController = require('../controllers/MRTController')
const AuthenticationControllerPolicy = require('../policies/AuthenticationControllerPolicy')
const isAuthenticated = require('../policies/isAuthenticated')
const asyncMiddleware = require('../utils/AsyncWrapper');
const validate = require('../validation');

module.exports = (app) => {

	// Authentication
	app.post('/api/register', AuthenticationControllerPolicy.register, AuthenticationController.register)
	app.post('/api/login', AuthenticationController.login)

	// MRT API
	app.get('/api/data-all', isAuthenticated, asyncMiddleware(MRTController.getAll))
	app.get('/api/data-prob', isAuthenticated, asyncMiddleware(MRTController.getProb))
	app.get('/api/data-epnl', isAuthenticated, asyncMiddleware(MRTController.getEpnl))
	app.get('/api/data-et', isAuthenticated, asyncMiddleware(MRTController.getEt))
	app.post('/api/fit', [isAuthenticated, validate.getFit], asyncMiddleware(MRTController.getFit))
	app.get('/api/data-get-scenarios', [isAuthenticated, validate.getScenarios], asyncMiddleware(MRTController.getScenarios))
	app.get('/api/data-get-barrier-scenarios', isAuthenticated, asyncMiddleware(MRTController.getBarrierScenarios))

	// User API
	app.post('/api/save-ou-Fit', isAuthenticated, asyncMiddleware(ApiController.saveOUFit))
	app.get('/api/find-strategy', isAuthenticated, asyncMiddleware(ApiController.findStrategy))
	app.get('/api/list-strategies', isAuthenticated, asyncMiddleware(ApiController.listStrategies))
	app.get('/api/userhistory', isAuthenticated, asyncMiddleware(ApiController.userHistory))
	app.post('/api/upload', isAuthenticated, asyncMiddleware(ApiController.upload))
	app.post('/api/remove', isAuthenticated, asyncMiddleware(ApiController.remove))
	app.get('/api/find-dict', isAuthenticated, asyncMiddleware(ApiController.listDictionary))
	app.get('/api/find-timeseries', isAuthenticated, asyncMiddleware(ApiController.findTimeseries))
}