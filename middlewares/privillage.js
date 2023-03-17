const User = require('../models/user-model')
const userResource = require('../responses/userresource')

async function hasPrivillages(req, res, next) {
    const [account] = await Promise.allSettled([User.findOne({ id: res.account.id })])
    if (account.status === 'rejected') return res.status(500).json(
        { messge: 'PRIVILLAGE_MIDDLEWARE: something went wrong' }
    )
    if (!Boolean(account?.value)) return res.status(404).json(
        { message: "PRIVILLAGE_MIDDLEWARE: null user" }
    )
    const Privillages = userResource(account.value).privillages
    res.privillages = Privillages
    next()
}



async function usePrivillages(req, res, next) {
    
    res.privillages = res.Privillages
    console.log(Privillages, "HAS PRIVILLAGES")
    next()
}



module.exports.hasPrivillages = hasPrivillages
module.exports.usePrivillages = usePrivillages
