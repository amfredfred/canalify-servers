const express = require('express')
const ROUTE = express.Router()
const System = require('../models/system')
const SystemWallet = require('../models/system-wallets')
const TransferMethod = require('../models/transfer-method-model')
const { hasPrivileges, usePrivileges } = require('../middlewares/privilage')
const { authenticated } = require('../middlewares/authenticated')
const { exchangeRate } = require('../middlewares/swap')

//Get All System Configs
ROUTE.get('', authenticated, hasPrivileges, usePrivileges, async (req, res) => {
    res.json(res.userinfo)
})

//Get exchange rate
ROUTE.post('/rates', exchangeRate, (req, res) => {
    const { conversionRate, conversionResult } = res.exchangeInfo
    res.json({ conversionRate, conversionResult })
})

//Import new transfer method
ROUTE.post('/new-transfer-method', async (req, res) => {
    const { name, active = true, description, code, wallets_for } = req.body
    const method_param = {}
    if (name) method_param.name = name
    if (active) method_param.active = active
    if (description) method_param.description = description
    if (code) method_param.code = code
    if (wallets_for) method_param.wallets_for = wallets_for
    const newTnxMethod = new TransferMethod(method_param)
    const [methodCreated] = await Promise.allSettled([newTnxMethod.save()])
    if (methodCreated.status === 'rejected') {
        return res.status(500).json({
            message: 'something went wrong!',
            error: methodCreated?.reason
        })
    }
    res.send("method created successfully!!")
})

//Get all transfer method
ROUTE.post('/get-transfer-methods', async (req, res) => {
    const { name, active = true, description, code, wallets_for } = req.body
    const method_param = TransferMethod.find({})
    if (name) method_param.name = name
    if (active) method_param.active = active
    if (description) method_param.description = description
    if (code) method_param.code = code
    if (wallets_for) method_param.wallets_for = wallets_for
    const [methodCreated] = await Promise.allSettled([method_param.exec()])
    if (methodCreated.status === 'rejected') {
        return res.status(500).json({
            message: 'something went wrong!',
            error: methodCreated?.reason
        })
    }
    res.json(methodCreated.value)
})


module.exports = ROUTE