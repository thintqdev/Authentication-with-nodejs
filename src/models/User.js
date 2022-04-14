const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    fullName: {type: String, require: true, min:3, max:50},
    email: {type: String, required: true, unique:true},
    password: {type: String, require: true},
    isVerified: {type: Number, default: 0},
    isAdmin: {type: Number, default: 0}
},{
    timestamps: true
})


module.exports = mongoose.model('user', UserSchema)