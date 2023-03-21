const Wallet = require('../models/wallet-model')
const Transaction = require('../models/transaction-model')
const SysWallet = require('../models/system-wallets')
const crypto = require('crypto')
const { URL } = require('url')
const DBconnection = require('mongoose').connection
require('dotenv').config()
const axios = require('axios')

async function canSwap(req, res, next) {
    const { from, to, value, minOutput } = req.body
    const initiator = res.account

    if (from?.code === to?.code) return res.status(400).send("CANSWAP: From and destination must not be same!")
    if (!Boolean(Number(value))) return res.status(400).send("CANSWAP: From amount is required!")

    const [Fw, Tw] = await Promise.allSettled([
        Wallet.findOne({ user_id: initiator.userId, code: from?.code }),
        Wallet.findOne({ user_id: initiator.userId, code: to?.code }),
        // SysWallet.find({})
    ])

    if (Fw.status === 'rejected' || Tw.status === 'rejected')
        return res.status(500).send("Something went wrong!")
    if (!Boolean(Fw?.value)) return res.status(400).send("CANSWAP: Wallet from?")
    if (!Boolean(Tw?.value)) return res.status(400).send("CANSWAP: Wallet to?")

    if (!Boolean(Fw?.value?.active)) return res.status(400).send("CANSWAP: Wallet from is inactive?")
    if (!Boolean(Tw?.value?.active)) return res.status(400).send("CANSWAP: Wallet to is inactive?")

    const exchangeInfo = {
        from: Fw?.value,
        to: Tw?.value,
        amount: Number(value),
        minOut: Number(minOutput)
    }

    res.exchangeInfo = exchangeInfo

    next()
}


async function exchangeRate(req, res, next) {
    const { from, to, value } = req.body
    const rateUrl = new URL(`${process.env.RATE_URL}/${process.env.RATE_API}/pair/${from?.code}/${to?.code}/${value}`)
    console.log(rateUrl)

    const liveRate = await axios('https://v6.exchangerate-api.com/v6/da8bb207555b91c52d1434ab/pair/NGN/USD/2')

    console.log(JSON.stringify(liveRate))

    next()
}


async function doSwap(req, res, next) {
    const { from, to, amount: value, minOut } = res.exchangeInfo
    const { userId } = res.account

    const destAmount = Number(Number(to?.rate) * Number(value)).toFixed(1)

    const balFrom = Number(Number(from?.balance_after) - Number(value))
    const balTo = Number(Number(to?.balance_after) + Number(destAmount))

    const fromTnxId = crypto.randomBytes(15).toString('hex').toUpperCase()
    const toTnxId = crypto.randomBytes(15).toString('hex').toUpperCase()

    if (Boolean(minOut))
        if (Boolean(destAmount < minOut))
            return res.status(400).send("DOSWAP: Insufficient output amount.")

    const TNXFromInfo = new Transaction({
        wallet_id: from?._id,
        transaction_type: "SWAP",
        confirmed: true,
        amount: value,
        transaction_id: fromTnxId,
        from: `My ${from?.code} Wallet`,
        to: `My ${to?.code} Wallet`,
        status: "SUCCESS",
        remarks: `You Exchanged ${from?.symbol}${value} For ${to?.symbol}${destAmount}`,
    })

    const TNXToInfo = new Transaction({
        wallet_id: to?._id,
        transaction_type: "SWAP",
        confirmed: true,
        amount: destAmount,
        transaction_id: toTnxId,
        from: `My ${from?.code} Wallet`,
        to: `MY ${to?.code} wallet`,
        status: "SUCCESS",
        remarks: `You Got ${to?.symbol}${destAmount} For ${from?.symbol}${value}`,
    })
    try {
        const [WFM, WT, TXF, TXT] = await Promise.allSettled([
            Wallet.findOneAndUpdate({ user_id: userId, code: from.code }, {
                balance_before: from.balance_after, balance_after: balFrom
            }),
            Wallet.findOneAndUpdate({ user_id: userId, code: to?.code }, {
                balance_before: to?.balance_after, balance_after: balTo
            }),
            TNXFromInfo.save(),
            TNXToInfo.save()
        ])

    } catch (error) {
        console.log('ERROR: WITH CREATING TRANSACTION', error)
        return res.status(400).send("DOSWAP: something went wrong!")
    }
    next()
}





module.exports.canSwap = canSwap
module.exports.doSwap = doSwap
module.exports.exchangeRate = exchangeRate