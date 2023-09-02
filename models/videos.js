const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    name: String
})

module.exports = mongoose.model('Video', videoSchema)