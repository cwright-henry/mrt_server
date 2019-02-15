const morgan = require('morgan');
const os = require('os');
const fs = require('fs');
const path = require('path');
const {createLogger, format, transports} = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const {combine, label, prettyPrint} = format;


morgan.token('conversation-id', function getConversationId(req) {
	return req.conversationId;
});
morgan.token('session-id', function getSessionId(req) {
	return req.sessionId;
});
morgan.token('instance-id', function getInstanceId(req) {
	return req.instanceId;
});
morgan.token('hostname', function getHostname() {
	return os.hostname();
});
morgan.token('pid', function getPid() {
	return process.pid;
});

function jsonFormat(tokens, req, res) {
	return JSON.stringify({
		'remote-address': tokens['remote-addr'](req, res),
		'time': tokens['date'](req, res, 'iso'),
		'method': tokens['method'](req, res),
		'url': tokens['url'](req, res),
		'http-version': tokens['http-version'](req, res),
		'status-code': tokens['status'](req, res),
		'content-length': tokens['res'](req, res, 'content-length'),
		'referrer': tokens['referrer'](req, res),
		'user-agent': tokens['user-agent'](req, res),
		'conversation-id': tokens['conversation-id'](req, res),
		'session-id': tokens['session-id'](req, res),
		'hostname': tokens['hostname'](req, res),
		'instance': tokens['instance-id'](req, res),
		'pid': tokens['pid'](req, res)
	});
}

const createTransports = function () {
  const customTransports = [];

  if (process.env.LOG_ENABLE_FILE === 'true') {
    if (!fs.existsSync(process.env.LOG_DIR)) {
      fs.mkdirSync(process.env.LOG_DIR);
    }

    customTransports.push(
      new transports.File({
        filename: path.join(process.env.LOG_DIR, process.env.LOG_FILE),
        level: process.env.LOG_LEVEL_FILE
      })
    );
  }

  if (process.env.LOG_ENABLE_CONSOLE === 'true') {
    customTransports.push(
      new transports.Console({
        level: process.env.LOG_LEVEL_CONSOLE
      })
    );
  }

  if (process.env.LOG_ENABLE_ELASTICSEARCH === 'true') {
    console.log('process.env.LOG_ENABLE_ELASTICSEARCH')
    customTransports.push(
      new Elasticsearch({
        level: process.env.LOG_LEVEL_ELASTICSEARCH
      })
    );
  }

  return customTransports;
};

const Logger = createLogger({
  transports: createTransports()
});

Logger.stream = {
  write: function(message, encoding) {
    Logger.info('message', JSON.parse(message));
  }
}

module.exports = {
	LoggingMiddleware: morgan(jsonFormat, {stream: Logger.stream}),
	Logger: Logger
}