const AuthenticationController = require('./controllers/AuthenticationController')
const ApiController = require('./controllers/ApiController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const isAuthenticated = require('./policies/isAuthenticated')

module.exports = (app) => {

	// Authentication
	app.post('/api/register', AuthenticationControllerPolicy.register, AuthenticationController.register)
	app.post('/api/login', AuthenticationController.login)

	// Api
	app.get('/api/findTs', isAuthenticated, ApiController.findTs)
	app.get('/api/alphavantage', isAuthenticated, ApiController.findAlphavantage)
	app.get('/api/find', isAuthenticated, ApiController.find)
	app.get('/api/list', isAuthenticated, ApiController.library)
	app.get('/api/userhistory', isAuthenticated, ApiController.userHistory)
	app.post('/api/upload', isAuthenticated, ApiController.upload)
	app.post('/api/remove', isAuthenticated, ApiController.remove)
	app.get('/api/data-all',  ApiController.getAll)
	app.get('/api/data-prob', ApiController.getProb)
	app.get('/api/data-epnl', ApiController.getEpnl)
	app.get('/api/data-et', ApiController.getEt)
	app.post('/api/fit', isAuthenticated, ApiController.getFit)
	app.get('/api/data-get-scenarios', isAuthenticated, ApiController.getScenarios)
	app.get('/api/data-get-barrier-scenarios', isAuthenticated, ApiController.getBarrierScenarios)
}