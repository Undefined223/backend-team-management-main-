const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const authenticatedMiddleware = require('../middlewares/authenticatedMiddlewhere');
const roleBasedMiddleware = require('../middlewares/roleBasedAuthenticationMiddleware');
const { success, error } = require('../utils');

const router = express.Router();

router.get(
    '/',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const { projectId } = req.query
            let payload = {};
            if(projectId) {
                const project = await Project.findById(projectId);
                payload = {
                    _id: { $nin: project.teamMembers },
                    role: { $nin: ['PROJECT_MANAGER'] }
                }
            }
            const users = await User.find(payload).select('-password');
            return success.fetched(res, users);
        } catch (e) {
            return error.error(res, 'Error fetching users')
        }
    }
)

router.delete(
    '/:id',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return error.notFound(res, 'User not found')
            }
            return success.fetched(res, 'User deleted successfully')

        } catch (e) {
            return error.error(res, 'Error deleting users')
        }
    }
)

router.post(
    '/',
    authenticatedMiddleware,
    roleBasedMiddleware('PROJECT_MANAGER'),
    async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password || !role) {
                return error.badRequest(res, 'Veuillez remplir tous les champs.')
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return error.badRequest(res, "L'email existe déjà.")
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role
            });
            await newUser.save();
            return success.created(res, 'User creaded successfully')
        } catch(e) {
            return error.error(res, 'Error creating users')
        }
    }
)


module.exports = router;
