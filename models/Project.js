const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    deadline: {
        type: Date
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
