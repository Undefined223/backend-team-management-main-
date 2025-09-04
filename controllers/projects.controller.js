const express = require('express');
const authenticatedMiddleware = require('../middlewares/authenticatedMiddlewhere');
const roleBasedMiddleware = require('../middlewares/roleBasedAuthenticationMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { success, error } = require('../utils');
const router = express.Router({ mergeParams: true });

router.get(
    '/',
    authenticatedMiddleware,
    async (req, res) => {
        try {
            const payload = req.user.role == "PROJECT_MANAGER" ? {} :  { teamMembers: req.user._id };
            const projects = await Project.find(payload).populate('teamMembers', '-password'); 
            return success.fetched(res, projects)
        } catch (e) {
            return error.error(res, 'Something went wrong');
        }
    }
)

router.get(
    '/:id',
    authenticatedMiddleware,
    async (req, res) => {
        try {
            const projectId = req.params.id;
            const user = req.user;
            const project = await Project.findById(projectId).populate('teamMembers', '-password');
            const payload = user.role == "PROJECT_MANAGER" ? { project: projectId } : { project: projectId, assignedTo: user._id };
            const tasks = await Task.find(payload).populate('assignedTo', '-password');
            return success.fetched(res, { ...project.toObject(), tasks: tasks })
        } catch (e) {
            return error.error(res, 'Error fetching projects');
        }
    }
)

router.post(
    '/',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const { name, description, deadline } = req.body;
            if (!name || description == null || !deadline) {
                return error.badRequest(res, 'Veuillez remplir tous les champs.');
            }
            const newProject = new Project({
                name,
                description,
                teamMembers: [],
                deadline
            });
            await newProject.save();
            return success.created(res);
        } catch (e) {
            return error.error(res, 'Something went wrong');
        }
    }
)

router.delete(
    '/:id',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const projectId = req.params.id;
            const project = await Project.findByIdAndDelete(projectId);
            if (!project) {
                return error.notFound(res, 'Project not found');
            }
            await Task.deleteMany({ project: projectId })
            return success.fetched(res, "Deleted successfully")
        } catch (e) {
            return error.error(res, 'Something went wrong');
        }
    }
)

router.post(
    '/:id/teamMembers',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const { userId } = req.body;
            const projectId = req.params.id;
            const project = await Project.findById(projectId);
            if (!project) {
                return error.notFound(res, 'Project not found');
            }
            const user = await User.findById(userId);
            if (!user) {
                return error.notFound(res, 'User not found');
            }
            if (project.teamMembers.includes(userId)) {
                return error.badRequest(res, 'User already part of the team');
            }
            project.teamMembers.push(userId);
            await project.save();
            return success.created(res, "Member added to the project successfully")
        } catch(e) {
            return error.error(res, 'Error adding team member' );
        }
    }
)

router.delete(
    '/:projectId/teamMembers/:userId',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const { projectId, userId } = req.params;
            const project = await Project.findById(projectId);
            if (!project) {
                return error.notFound(res, 'Project not found');
            }
            const user = await User.findById(userId);
            if (!user) {
                return error.notFound(res, 'User not found');
            }
            if (!project.teamMembers.includes(userId)) {
                return error.badRequest(res, 'User is not part of the team');
            }
            project.teamMembers = project.teamMembers.filter(id => id != userId);

            const tasks = await Task.find({ project: projectId, assignedTo: userId });
            if(tasks && tasks.length > 0) {
                tasks.forEach(async (task) => {
                    if(task.status != "done") {
                        task.assignedTo = null;
                        task.status = "to-do";
                        await task.save();
                    }
                });
            }

            await project.save();
            return success.created(res, "User deleted successfully")
        } catch (e) {
            return error.error(res, 'Error removing team member');
        }
    }
)

module.exports = router;
