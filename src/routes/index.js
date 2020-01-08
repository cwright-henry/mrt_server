const UserController = require('../controllers/UserController')
const ApiController = require('../controllers/ApiController')
const MRTController = require('../controllers/MRTController')
const AdminController = require('../controllers/AdminController')
const { isAuthenticated, grantAccess } = require('../policies/rbac')
const asyncMiddleware = require('../utils/AsyncWrapper');
const validate = require('../validation');

module.exports = (app) => {

	// Admin API
	app.post('/admin/login',
		[validate.login],
		AdminController.login);
	app.get('/admin/users',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.searchUsers],
		asyncMiddleware(AdminController.getUsers));
	app.get('/admin/user',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.userFind],
		asyncMiddleware(AdminController.getUser));
	app.post('/admin/user',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.newUser],
		asyncMiddleware(AdminController.createUser));
	app.put('/admin/user/set-password',
		[isAuthenticated, grantAccess('updateAny', 'user'), validate.setPassword],
		asyncMiddleware(AdminController.setPassword));
	app.put('/admin/user',
		[isAuthenticated, grantAccess('updateAny', 'user'), validate.updateUser],
		asyncMiddleware(AdminController.updateUser));
	app.get('/admin/user/history',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.userHistory],
		asyncMiddleware(AdminController.userHistory));
	app.delete('/admin/user',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.userRemove],
		asyncMiddleware(AdminController.removeUser));
	app.get('/admin/tickers',
		[isAuthenticated, grantAccess('readAny', 'user')],
		asyncMiddleware(ApiController.getTickers));
	app.post('/admin/tickers',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.createTicker],
		asyncMiddleware(AdminController.createTicker));
	app.get('/admin/tickers/test',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.textTicker],
		asyncMiddleware(AdminController.testTicker));
	app.delete('/admin/tickers',
		[isAuthenticated, grantAccess('readAny', 'user'), validate.tickerRemove],
		asyncMiddleware(AdminController.removeTicker));

	// User API
	app.post('/api/register',
		[validate.register],
		UserController.register);
	app.post('/api/login',
		[validate.login],
		UserController.login);
	app.post('/api/update-password',
		[isAuthenticated, grantAccess('updateOwn', 'account'), validate.upatePassword],
		asyncMiddleware(UserController.updatePassword));
	app.post('/api/save-ou-Fit',
		[isAuthenticated, grantAccess('updateOwn', 'account')],
		asyncMiddleware(ApiController.saveOUFit));
	app.get('/api/find-strategy',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(ApiController.findStrategy));
	app.get('/api/search-strategy',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(ApiController.searchStrategies));
	app.get('/api/list-strategies',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(ApiController.listStrategies));
	app.get('/api/userhistory',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(ApiController.userHistory));
	app.post('/api/upload',
		[isAuthenticated, grantAccess('updateOwn', 'account')],
		asyncMiddleware(ApiController.upload));
	app.post('/api/remove',
		[isAuthenticated, grantAccess('updateOwn', 'account')],
		asyncMiddleware(ApiController.remove));
	app.get('/api/get-library',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(ApiController.getLibrary));
	app.get('/api/find-timeseries',
		[isAuthenticated, grantAccess('readOwn', 'account'), validate.getTimeseries],
		asyncMiddleware(ApiController.findTimeseries));


	// MRT API
	app.get('/api/data-all',
		[isAuthenticated, grantAccess('readOwn', 'account'), validate.getAllSchema],
		asyncMiddleware(MRTController.getAll));
	app.get('/api/data-prob',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(MRTController.getProb));
	app.get('/api/data-epnl',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(MRTController.getEpnl));
	app.get('/api/data-et',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(MRTController.getEt));
	app.post('/api/fit-lse',
		[isAuthenticated, grantAccess('readOwn', 'account'), validate.getFitLSE],
		asyncMiddleware(MRTController.getFitLSE));
	app.get('/api/fit',
		[isAuthenticated, grantAccess('readOwn', 'account'), validate.getFit],
		asyncMiddleware(MRTController.getFit));
	app.get('/api/data-get-scenarios',
		[isAuthenticated, grantAccess('readOwn', 'account'), validate.getScenarios],
		asyncMiddleware(MRTController.getScenarios));
	app.get('/api/data-get-barrier-scenarios',
		[isAuthenticated, grantAccess('readOwn', 'account')],
		asyncMiddleware(MRTController.getBarrierScenarios));
}