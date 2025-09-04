const { error } = require('../utils')

const roleBasedAuthenticationMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return error.forbidden(res, 'User not well specified');
        }
        const hasRole = allowedRoles.includes(user.role);
        if (!hasRole) {
            return error.forbidden(res, "You don't have permissions to do that");
        }
        next();
    };
}

module.exports = roleBasedAuthenticationMiddleware;
