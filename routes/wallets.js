const express = require('express')
const ROUTE = express.Router()
const User = require('../models/user-model')
const Wallet = require('../models/wallet-model')
const { authenticated } = require('../middlewares/authenticated')
const { findWallet } = require('../middlewares/findwallet')
const { walletResource } = require('../responses/walletresource')


/* Get a wallet */
ROUTE.get('/:id', authenticated, findWallet, async (req, res) => {
    const wallet = res.wallet
    res.json({
        wallet,
        exists: Boolean(wallet),
        message: `Wallet ${!Boolean(wallet) ? "Not" : ''} Found`
    })
})

/* Create a wallet for user*/
ROUTE.post('', authenticated, findWallet, async (req, res) => {
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
        return res.status(500).send('soemthing went wrong!')

    const wallet = walletResource(walletSaved.value)

    res.status(201).send("wallet activated successfully!")
})

/* Patch a user wallet */
ROUTE.patch('', authenticated, findWallet, async (req, res) => {
    const { code, active } = req.body
    const [walletSaved] = await Promise.allSettled([Wallet.findOneAndUpdate({ code }, { active })])
    walletSaved.value.active = active
    if (walletSaved.status === 'rejected')
        return res.status(500).send('something went wrong!')
    const wallet = walletResource(walletSaved.value)
    res.send("wallet updated successfully!")
})




















module.exports = ROUTE
