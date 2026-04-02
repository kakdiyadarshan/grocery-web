const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

exports.auth = async (req, res, next) => {
    try {
        let authorization = req.headers['authorization']

        if (authorization) {
            let token = await authorization.split(' ')[1]

            if (!token) {
                return res.status(401).json({ status: 401, message: "Token Is Required" })
            }

            let checkToken = jwt.verify(token, process.env.SECRET_KEY)

            let checkUser = null;
            checkUser = await User.findById(checkToken._id);
            if (!checkUser) {
                return res.status(401).json({ status: 401, message: "User Not Found" })
            }
            req.user = checkUser
            next()
        }
        else {
            return res.status(401).json({ status: 401, message: "Token Is Required" });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: 401, message: "Please Login Again" })
    }
}

exports.authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).send("Admin only access..!");
    }
    next();
};

