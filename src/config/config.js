const path = require('path')

module.exports = {
  port: process.env.PORT || 3031,
  db: {
    baseURL: process.env.DB_NAME || 'mongodb://localhost:27017/mrt',
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret'
  }
}