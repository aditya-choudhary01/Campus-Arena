function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: "Please log in before doing this."
        });
    }
    next();
}

module.exports = requireLogin;
