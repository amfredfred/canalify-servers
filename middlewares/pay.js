const TransferMethod = require('../models/transfer-method-model')
const FW = require('flutterwave-node-v3')
require('dotenv').config()

async function canPay(req, res, next) {
    const { method, currency, destination, value } = req.body
    const { userinfo } = res
    const allMethods = TransferMethod.findOne({})
    const param = allMethods.code = allMethods.regex('code', new RegExp(method, 'i'))
    const [transferMethod] = await Promise.allSettled([param.exec()])
    if (transferMethod.status === 'rejected')
        return res.send("Pay |:| Something went wrong!")
    const useMethod = transferMethod?.value
    const forWallets = useMethod?.wallets_for || []
    if (transferMethod.status === 'fulfilled') {
        if (!Boolean(useMethod?.active))
            return res.status(400).send(`Pay |:| ${useMethod?.code} method is paused!`)
        if (!forWallets.includes("*") && !forWallets.includes("all"))
            if (!forWallets.includes(currency))
                return res.status(400).send(`Pay |:| ${useMethod?.code} method is not available for "${currency}" currency!`)
    }


    res['payInfo'] = {}
    res['payInfo']['method'] = transferMethod?.value
    res['payInfo']['currency'] = currency
    res['payInfo']['amount'] = value
    res['payInfo']['sender'] = userinfo
    res['payInfo']['destination'] = destination

    next()
}


async function usePayRoute(req, res, next) {
    const { method,
        currency,
        amount,
        sender,
        destination 
    } = res.payInfo

    console.log(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY) 

    if ((method?.code).toLowerCase() === 'bank') {
        const fw = new FW(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)
        const banks = await fw.Bank.country({ "country": "NG" })


        console.log(banks)
    }

    next()
}


async function sendMoney(req, res, next) {
    const { userinfo } = res
    const { destination } = req.body
    // console.log({ destination, userinfo })
    next()
}




module.exports.canPay = canPay
module.exports.usePayRoute = usePayRoute
module.exports.sendMoney = sendMoney