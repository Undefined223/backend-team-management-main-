const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DESIGNER', 'SECURITY'],
        default: 'DEVELOPER'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
