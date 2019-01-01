const AuthenticationController = require('../controllers/AuthenticationController')
const ApiController = require('../controllers/ApiController')
const MRTController = require('../controllers/MRTController')
const AuthenticationControllerPolicy = require('../policies/AuthenticationControllerPolicy')
const isAuthenticated = require('../policies/isAuthenticated')

module.exports = (app) => {

	// Authentication
	app.post('/api/register', AuthenticationControllerPolicy.register, AuthenticationController.register)
	app.post('/api/login', AuthenticationController.login)

	// MRT API
	app.get('/api/data-all', isAuthenticated, MRTController.getAll)
	app.get('/api/data-prob', isAuthenticated, MRTController.getProb)
	app.get('/api/data-epnl', isAuthenticated, MRTController.getEpnl)
	app.get('/api/data-et', isAuthenticated, MRTController.getEt)
	app.post('/api/fit', isAuthenticated, MRTController.getFit)
	app.get('/api/data-get-scenarios', isAuthenticated, MRTController.getScenarios)
	app.get('/api/data-get-barrier-scenarios', isAuthenticated, MRTController.getBarrierScenarios)

	// User API
	app.post('/api/save-ou-Fit', isAuthenticated, ApiController.saveOUFit)
	app.get('/api/find-strategy', isAuthenticated, ApiController.findStrategy)
	app.get('/api/list-strategies', isAuthenticated, ApiController.listStrategies)
	app.get('/api/userhistory', isAuthenticated, ApiController.userHistory)
	app.post('/api/upload', isAuthenticated, ApiController.upload)
	app.post('/api/remove', isAuthenticated, ApiController.remove)
	app.get('/api/find-dict', isAuthenticated, ApiController.listDictionary)
	app.get('/api/find-timeseries', isAuthenticated, ApiController.findTimeseries)
}