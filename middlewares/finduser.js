const User = require('../models/user-model')

async function findUser(req, res, next) {
    const query_params = {}
    const account = req.body.id || req.body.username || req.body.phone
        || req.params.username || req.params.phone || req.params.phone
        || req.params.id || req.body.email || req.param.email

    if (!Boolean(account)) return res.status(406).json({
        message: 'account identifier required'
    })

    if (String(account).split('@')[1])
        query_params.email = String(account).toUpperCase()
    if (String(account).length <= 7 && !String(account).split('@')[1])
        query_params.username = String(account).toUpperCase()
    if (String(account).length > 9 && !String(account).split('@')[1])
        query_params.phone = String(account).toUpperCase()

    const [user] = await Promise.allSettled([User.findOne(query_params)])

    if (user?.status === 'rejected') {
        res.status(500).json({
            message: 'something went wrong',
            error: user?.reason?.errors
        })
    }
    res['user'] = user.value
    next()
}


module.exports.findUser = findUser