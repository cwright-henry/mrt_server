const User = require('../models/users')
const jwt = require('jsonwebtoken')

function jwtSignUser (user) {
  const ONE_WEEK = 60 * 60 * 24 * 7
  return jwt.sign(user, process.env.APP_SECRET, {
    expiresIn: ONE_WEEK
  })
}

module.exports = { 
  async register (req, res) {
    try {
      const newUser = new User({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        email: req.body.email,
        password: req.body.password
      });
      const user = await User.create(newUser)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } 
    catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'This email account is already in use.'
      })
    }
  },

  async login (req, res) {
    try {
      const {email, password} = req.body
      const user = await User.findByEmail(email)

      if (!user) {
        return res.status(403).send({
          code: 'INVALID_LOGIN'
        })
      }

      const isPasswordValid = await User.comparePassword(password, user.password)
      if (!isPasswordValid) {
        return res.status(403).send({
          code: 'INVALID_LOGIN'
        })
      }

      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } 
    catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}