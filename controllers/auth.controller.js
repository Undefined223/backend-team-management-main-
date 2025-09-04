const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const authenticatedMiddleware = require('../middlewares/authenticatedMiddlewhere');
const { success, error } = require('../utils');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return error.notFound(res, 'No user found with specified email')
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return error.notFound(res, 'Invalid credentials')
        }
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            config.get('jwtSecret'),
            { expiresIn: config.get('tokenExpire') }
        );
        return success.created(res, { token, user })
    } catch (err) {
        return error.error(res, 'Something went wrong');
    }
})

router.post('/me', authenticatedMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const fullOldUser = await User.findById(user._id);
        const { name, email, password, currentPassword, confirmPassword, role } = req.body;
        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, fullOldUser.password);
            if (!isMatch) {
                return error.badRequest(res, 'Wrong current password');
            }
            if (password != confirmPassword) {
                return error.badRequest(res, 'Password confirmation do not match');

            }
        }

        const salt = await bcrypt.genSalt(10);
        user.email = email || user.email
        user.name = name || user.name
        user.role = role || user.role
        user.password = currentPassword ?
            password ? await bcrypt.hash(password, salt) : fullOldUser.password
            : fullOldUser.password;
        await user.save();
        return success.created(res, "Profile updated successfully")
    } catch (e) {
        return error.error(res, "Something went wrong");
    }
});

router.get('/me', authenticatedMiddleware, (req, res) => {
    return success.fetched(res, req.user)
})

module.exports = router;
