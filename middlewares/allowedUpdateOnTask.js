const Project = require('../models/Project');
const Task = require('../models/Task');
const { error } = require('../utils')

const allowedUpdateOnTask = (checkAssignee) => {
    return async (req, res, next) => {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const user = req.user;

        const project = await Project.findById(projectId)
        if (!project) {
            return error.notFound(res, 'Project not found')
        }
        const task = await Task.findById(taskId).populate('assignedTo', '-password')

        if (!task) {
            return error.notFound(res, 'Task not found')
        }

        if(checkAssignee) {
            if (task.assignedTo?._id.toString() != user._id.toString()) {
                return error.notFound(res, 'Not allowed to perform action on this task')
            }
        }
        req.task = task;
        next();
    }
}

module.exports = allowedUpdateOnTask;
