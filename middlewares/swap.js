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

    if (from === to) return res.status(400).send("CANSWAP: From and destination must not be same!")
    if (!Boolean(Number(value))) return res.status(400).send("CANSWAP: From amount is required!")

    const [Fw, Tw] = await Promise.allSettled([
        Wallet.findOne({ user_id: initiator.userId, code: from }),
        Wallet.findOne({ user_id: initiator.userId, code: to }),
        // SysWallet.find({})
    ])

    if (Fw.status === 'rejected' || Tw.status === 'rejected')
        return res.status(500).send("Something went wrong!")
    if (!Boolean(Fw?.value)) return res.status(400).send("CANSWAP: Wallet from?")
    if (!Boolean(Tw?.value)) return res.status(400).send("CANSWAP: Wallet to?")

    if (!Boolean(Fw?.value?.active)) return res.status(400).send(`CANSWAP - Your ${Fw?.value?.code} Wallet is inactive!`)
    if (!Boolean(Tw?.value?.active)) return res.status(400).send(`CANSWAP - Your ${Tw?.value?.code} Wallet  is inactive`)

    const exchangeInfo = {}
    exchangeInfo['from'] = Fw?.value
    exchangeInfo['to'] = Tw?.value
    exchangeInfo['amount'] = Number(value)
    exchangeInfo['minOut'] = Number(minOutput)
    res['exchangeInfo'] = exchangeInfo

    next()
}


async function exchangeRate(req, res, next) {
    const { from, to, value } = req.body


    if (!Boolean(from)) return res.status(400).send("EXCHANGE: Currency From is required!")
    if (!Boolean(to)) return res.status(400).send("EXCHANGE: Currency To is required!")


    const rateUrl = new
        URL(`${process.env.RATE_URL}/${process.env.RATE_API}/pair/${from}/${to}/${Boolean(value) ? value : 1}`)

    const [liveRate] = await Promise.allSettled([
        axios(rateUrl?.href)
    ])

    console.log(liveRate)

    if (liveRate?.status === 'rejected') {
        return res.status(400).send(`EXCHANGE: Could not get rate for ${from}_${to}`)
    }

    const CR = Number(liveRate?.value?.data?.conversion_rate)
    const CRS = Number(liveRate?.value?.data?.conversion_result)
    const OPT = Number(Math.round(CRS * 100) / 100)
    res['exchangeInfo'] = res['exchangeInfo'] ?? {}
    res['exchangeInfo']['conversionResult'] = OPT
    res['exchangeInfo']['conversionRate'] = CR

    next()
}


async function doSwap(req, res, next) {
    const {
        from, to, amount: value, minOut,
        conversionRate, conversionResult
    } = res.exchangeInfo

    const { userId } = res.account

    const destAmount = Number(conversionResult)
    const balFrom = Number(Number(from?.balance_after) - Number(value))
    const balTo = Number(Number(to?.balance_after) + Number(destAmount))

    const fromTnxId = crypto.randomBytes(15).toString('hex').toUpperCase()
    const toTnxId = crypto.randomBytes(15).toString('hex').toUpperCase()

    if (destAmount <= 0)
        return res.status(400).send("DOSWAP: Negetive destination amount.")

    if (balFrom <= 0)
        return res.status(400).send(`DOSWAP: Insufficient ${from?.code} balance!`)

    if (balTo <= 0)
        return res.status(400).send(`DOSWAP: You cannot receive 0 ${balTo}!`)

    if (Boolean(minOut))
        if (Boolean(destAmount < Number(minOut)))
            return res.status(400).send("DOSWAP: Insufficient output amount.")

    const TNXFromInfo = new Transaction({
        wallet_id: from?._id,
        transaction_type: "SWAP",
        confirmed: true,
        amount: value,
        transaction_id: fromTnxId,
        from: `My ${from} Wallet`,
        to: `My ${to} Wallet`,
        status: "SUCCESS",
        remarks: `You Exchanged ${from?.symbol}${value} For ${to?.symbol}${destAmount}`,
    })

    const TNXToInfo = new Transaction({
        wallet_id: to?._id,
        transaction_type: "SWAP",
        confirmed: true,
        amount: destAmount,
        transaction_id: toTnxId,
        from: `My ${from} Wallet`,
        to: `MY ${to} wallet`,
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

    res['exchangeInfo'] = {}
    res['exchangeInfo']['message'] = `You have received: ${to?.code}${destAmount}`

    next()
}


module.exports.canSwap = canSwap
module.exports.exchangeRate = exchangeRate
module.exports.doSwap = doSwap