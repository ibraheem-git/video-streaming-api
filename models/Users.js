const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    verified: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema)