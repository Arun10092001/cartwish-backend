module.exports = function (req, res, next) {
    // 401 Unauthorized
    // 403 Forbidden
    if (!req.user)
        return res.status(401).send("Access denied");

    if (!req.user.isAdmin)
        return res.status(403).send("Access denied (Admin Only)");

    next();
};
