const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },

        status: {
            type: String,
            enum: ['to-do', 'in-progress', 'done'],
            default: 'to-do'
        },

        storyPoints: {
            type: Number,
            enum: [1, 2, 3, 5, 8, 13],
            default: 1
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
