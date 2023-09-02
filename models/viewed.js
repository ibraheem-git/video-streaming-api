const mongoose = require('mongoose');

const viewedSchema = mongoose.Schema({
    name: String,
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('viewed', viewedSchema)