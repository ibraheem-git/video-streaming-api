function authenticate(req, res, next) {
    
    if (!req.session || req.session.sessionId) {
        const err = new Error("you shall not pass");
        err.statusCode = 401;
        next(err)
    }
    next()
}

module.exports = authenticate