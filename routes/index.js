const auth = require('./auth')
const user = require('./user')

function route(app){
    app.use('/api/auth', auth),
    app.use('/api/user', user)
}
module.exports = route