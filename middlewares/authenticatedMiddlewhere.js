const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const { error } = require('../utils')


const authenticatedMiddleware = async (req, res, next) => {
    const authentication = req.headers.authorization || req.headers.Authorization;
    if (!authentication) {
        return error.forbidden(res, 'No authorization token provided')
    }
    if(!authentication.startsWith('Bearer ')) {
        return error.forbidden(res, 'wrong token')
    }
    let token = authentication.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return error.forbidden(res, 'No user found')
        }
        next();
    } catch (err) {
        console.error(err.message);
        return error.error(res, 'No user found')
    }
}
module.exports = authenticatedMiddleware;
