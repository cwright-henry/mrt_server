const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
	ac.grant("mrt")
		.readOwn("account")
		.updateOwn("account")

	ac.grant("admin")
		.extend("mrt")
		.updateAny("user")
		.deleteAny("user")
		.readAny("user")
		.deleteAny("user")

	return ac;
})();