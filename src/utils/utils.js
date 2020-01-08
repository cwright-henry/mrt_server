const parser = require('ua-parser-js');
const geoip = require('geoip-lite');

const isEmpty = value => {
	return value === null || value === undefined
}

const createMeta = request => {
	const { headers, _remoteAddress } = request;
	const { country = '', region = '', timezone = '', city = '', ll = [] } = geoip.lookup(headers['x-forwarded-for']) || {};

	const meta = JSON.stringify({
		agent: parser(headers['user-agent']),
		xForwardedFor: headers['x-forwarded-for'],
		acceptLanguage: headers['accept-language'],
		remoteAddress: _remoteAddress,
		country,
		region,
		timezone,
		city,
		ll
	});

	return meta;
}

module.exports = {
	isEmpty,
	createMeta
};