const Wallet = require('../models/wallet-model')
const User = require('../models/user-model')

async function findWallet(req, res, next) {
    const query_params = { user_id: res.account.userId }
    const identifier = req.body.user_id || req.body.symbol || req.body.name
        || req.body.base_wallet || req.param.active || req.body.active || req.body.code

    if (!Boolean(identifier)) return res.status(406).json({
        message: 'wallet identifier required'
    })

    if (req.body.user_id) query_params.user_id = req.body.user_id
    if (req.body.symbol) query_params.symbol = req.body.symbol
    if (req.body.name) query_params.name = req.body.name
    if (req.body.base_wallet) query_params.base_wallet = Boolean(req.body.base_wallet)
    if (req.param.active) query_params.active = Boolean(req.param.active)
    if (req.body.active) query_params.active = Boolean(req.body.active)
    if (req.body.code) query_params.code = req.body.code

    const [wallet] = await Promise.allSettled([Wallet.findOne(query_params)])

    if (wallet?.status === 'rejected') {
        res.status(500).json({
            message: 'something went wrong',
            error: wallet?.reason?.errors
        })
    }
    res.wallet = wallet.value
    next()
}


module.exports.findWallet = findWallet