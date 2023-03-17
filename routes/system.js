const express = require('express')
const ROUTE = express.Router()
const System = require('../models/system')
const SystemWallet = require('../models/system-wallets')
const { hasPrivillages } = require('../middlewares/privillage')
const { authenticated } = require('../middlewares/authenticated')

//Get All System Configs
ROUTE.get('', authenticated, hasPrivillages, async (req, res) => {

    const [systemWallets, systemSettings] = await Promise.allSettled([
        SystemWallet.find({}),
        System.find({})
    ])

    res.json({ systemWallets, systemSettings })

})

















module.exports = ROUTE