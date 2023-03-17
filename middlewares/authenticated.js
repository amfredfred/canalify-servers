require('dotenv').config()
const jwt = require('jsonwebtoken')

async function authenticated(req, res, next) {
    const { authorization } = req.headers
    const accessToken = String(authorization).split(' ')[1]
    if (!Boolean(accessToken)) return res.status(401).json({ message: "You are not authenticated!" })
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, account) => {
        if (Boolean(err)) return res.status(403).json({ message: "try loggin in again!" })
        res.account = account
    })
    next()
}

module.exports.authenticated = authenticated