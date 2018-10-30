const Joi = require('joi')

const registerSchema = {
  firstname: Joi.string(),
  lastname: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().regex(
    new RegExp('^[a-zA-Z0-9]{8,32}$')
  )
}

const loginSchema = {
  email: Joi.string().email(),
  password: Joi.string().regex(
    new RegExp('^[a-zA-Z0-9]{8,32}$')
  )
}

module.exports = {
  register (req, res, next) {
    const {error} = Joi.validate(req.body, registerSchema)

    if (error) {
      res.status(400).send({
				error: error
      })
		} 
		else {
      next()
    }
  },
  login (req, res, next) {
    const {error} = Joi.validate(req.body, loginSchema)
    
    if (error) {
      res.status(400).send({
				error: error
      })
		} 
		else {
      next()
    }
  }
}