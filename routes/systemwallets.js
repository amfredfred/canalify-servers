const express = require('express')
const ROUTE = express.Router()
const System = require('../models/system')
const SystemWallet = require('../models/system-wallets')
const { walletCollection } = require('../responses/walletresource')

//Get AllWallets
ROUTE.get('', async (req, res) => {
    const { name, code, useable, symbol, active, fee, rate, base_wallet } = req.body
    const query_params = SystemWallet.find({})
    if (name) query_params.name = name
    if (code) query_params.code = code
    if (useable) query_params.useable = Boolean(useable)
    if (symbol) query_params.symbol = symbol
    if (active) query_params.active = active
    if (fee) query_params.fee = fee
    if (base_wallet) query_params.base_wallet = Boolean(base_wallet)
    if (rate) query_params.rate = rate
    query_params.regex('code', new RegExp(code, 'i'))
    query_params.regex('symbol', new RegExp(symbol, 'i'))
    query_params.regex('name', new RegExp(name, 'i'))
    const [systemWallets] = await Promise.allSettled([query_params.exec()])
    if (systemWallets.status === 'rejected') {
        return res.status(500).json({ message: "something went wrong!" })
    }
    if (!Boolean(systemWallets?.value)) {
        return res.json({ systemWallets: systemWallets?.value })
    }
    const walletsCollection = walletCollection(systemWallets?.value)
    res.json({ systemWallets: walletsCollection })
})

//Importing new wallet
ROUTE.post('', async (req, res) => {

    const { name, code, useable, symbol, active, fee, rate } = req.body
    const nW = new SystemWallet({ name, code, useable, symbol, active, fee, rate })

    const [svdW] = await Promise.allSettled([nW.save()])

    if (svdW.status === 'rejected') {
        return res.status(500).json({
            message: 'something went wrong!',
            error: svdW?.reason
        })
    }

    res.status(201).json({ wallet: svdW })
})


ROUTE.patch('', async (req, res) => {
    const {
        name, code, useable,
        symbol, active, fee, rate, base_wallet
    } = req.body

    const [walletUpdate] = await Promise.allSettled([
        SystemWallet.findOneAndUpdate({ code },
            { name, useable, symbol, active, fee, code, rate, base_wallet }
        )])

    if (walletUpdate.status === 'rejected') {
        return res.status(500).json({
            message: 'something went wrong!',
            error: walletUpdate?.reason
        })
    }

    res.json({ message: "wallet updated successfully!!", wallet: walletUpdate?.value })
})

module.exports = ROUTE