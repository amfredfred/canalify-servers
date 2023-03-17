const express = require('express')
const ROUTE = express.Router()
const User = require('../models/user-model')
const Wallet = require('../models/wallet-model')
const { authenticated } = require('../middlewares/authenticated')
const { findWallet } = require('../middlewares/findwallet')
const walletResource = require('../responses/walletresource')


/* Get a wallet */
ROUTE.get('/:id', authenticated, findWallet, async (req, res) => {
    const wallet = res.wallet
    res.json({
        wallet,
        exists: Boolean(wallet),
        message: `Wallet ${!Boolean(wallet) ? "Not" : ''} Found`
    })
})

/* Create a wallet */
ROUTE.post('/', authenticated, findWallet, async (req, res) => {
    const { symbol, code, name } = req.body

    if (Boolean(res.wallet)) return res.status(400).json({
        message: "wallet already exists",
        exists: true
    })

    const newWallet = new Wallet({
        user_id: res.account.userId,
        symbol, code, name,
        base_wallet: true,
        balance_before: Math.random() * 21,
        balance_after: 0,
        balance_as_base: Math.random() * 400, 
        rate: 1,
    })

    const [walletSaved] = await Promise.allSettled([newWallet.save()])

    if (walletSaved.status === 'rejected')
        return res.status(500).json({ message: 'soemthing went wrong!' })

    const wallet = walletResource(walletSaved.value)
    console.log(wallet, 'NEW WALLET')
    res.status(201).json({ message: "wallet activated successfully!", wallet })
})


















module.exports = ROUTE
