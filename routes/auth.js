const route = require('express').Router()
const authController = require('../src/controllers/AuthController')

route.post('/register', authController.register)
route.post('/login', authController.login)
route.get('/checktoken', authController.isTokenExpired)
route.get('/verify/:id/:token', authController.verify)

module.exports = route