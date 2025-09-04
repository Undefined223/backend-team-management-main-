const express = require('express');
const authenticatedMiddleware = require('../middlewares/authenticatedMiddlewhere');
const roleBasedMiddleware = require('../middlewares/roleBasedAuthenticationMiddleware');
const allowedUpdateOnTask = require('../middlewares/allowedUpdateOnTask');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { success, error } = require('../utils');
const router = express.Router({ mergeParams: true });

router.post(
    '/',
    authenticatedMiddleware,
    roleBasedMiddleware("PROJECT_MANAGER"),
    async (req, res) => {
        try {
            const projectId = req.params.projectId;
            const project = await Project.findById(projectId)
            if(!project) {
                return error.notFound(res, "Project not found")
            }

            const { title, description, assignedTo, storyPoints } = req.body;

            if(!title || !description || !assignedTo) {
                error.badRequest(res, "Please fill all fields")
            }
            const user = User.findById(assignedTo);
            if(!user) {
                return error.notFound(res, "User not found")
            }
            const task = new Task({
                title,
                description,
                project: projectId,
                assignedTo,
                storyPoints
            })
            await task.save()
            return success.created(res, 'Task created successfully')
        } catch (e) {
            return error.error(res, "Error while creating a task" );
        }
    }
)

router.put(
    '/:taskId/general',
    authenticatedMiddleware,
    roleBasedMiddleware("PROJECT_MANAGER"),
    allowedUpdateOnTask(false),
    async (req, res) => {
        try {
            const task = req.task;
            const { title, description, storyPoints } = req.body;

            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (storyPoints !== undefined) task.storyPoints = storyPoints;

            await task.save();

            return success.updated(res, 'Task updated successfully', task); 
        } catch (e) {
            console.error('Update error:', e);
            return error.internalError(res, "Error while updating the task");
        }
    }
)
router.put(
    '/:taskId/assignee',
    authenticatedMiddleware,
    roleBasedMiddleware("PROJECT_MANAGER"),
    allowedUpdateOnTask(false),
    async (req, res) => {
        try {
            const task = req.task;
            const { assignedTo } = req.body;

            const user = await User.findById(assignedTo);
            if (!user) {
                return error.notFound(res, "User not found");
            }

            task.assignedTo = assignedTo;
            await task.save();
            return success.created(res, 'Assigned to user successfully');
        } catch (err) {
            return error.error(res, "Error while updating the task");
        }
    }
);
router.put(
    '/:taskId/status',
    authenticatedMiddleware,
    roleBasedMiddleware('DEVELOPER', 'TESTER', 'DESIGNER', 'SECURITY'),
    allowedUpdateOnTask(true),
    async (req, res) => {
        try {
            const task = req.task;
            const { status } = req.body;
            task.status = status;
            await task.save();
            return success.created(res, 'Task status updated successfully')
        } catch (e) {
            return error.error(res, "Error while updating the task");
        }
    }
)

router.delete(
    '/:taskId',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    allowedUpdateOnTask(false),
    async (req, res) => {
        try {
            const task = req.task;
            await Task.deleteOne({ _id: task._id })
            return success.created(res, 'Task deleted successfully')
        } catch (e) {
            return error.error(res, "Error while deleting the task");
        }
    }
)


module.exports = router;
