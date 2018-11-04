const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
 
const esTransportOpts = {
  level: 'info'
};

const Logger = winston.createLogger({
	format: winston.format.json(),
  transports: [
    new Elasticsearch(esTransportOpts)
  ]
})

Logger.stream = {
  write: function(message, encoding) {
    //Logger.info('message', JSON.parse(message));
    console.log(message)
  }
}

module.exports = Logger;
