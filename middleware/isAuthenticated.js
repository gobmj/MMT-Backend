const jwt = require('jsonwebtoken');
const ErrorHandler = require('./errorHandlers');

module.exports = async (req, res, next) => {

    const bearer = req.headers.authorization;
    if (!bearer) {
        return next(new ErrorHandler("Authorization header not provided", 401));
    }

    const token = bearer.split(' ')[1];
    if (!token) {
        return next(new ErrorHandler("Token not found", 401));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRETKEY);
        req.username = decodedToken.username;
        next();
    } catch (error) {
        return next(new ErrorHandler("Token not valid", 401));
    }
};