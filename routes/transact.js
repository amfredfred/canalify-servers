const express = require('express')
const bcrypt = require('bcrypt')
const { canSwap, doSwap, exchangeRate } = require('../middlewares/swap')
const { authenticated } = require('../middlewares/authenticated')
const { canPay, sendMoney, usePayRoute } = require('../middlewares/pay')
const ROUTE = express.Router()


//
ROUTE.get('/', (req, res) => {
    res.send('TRANSACT WORKING')
})

//
ROUTE.post('/swap', authenticated, canSwap, exchangeRate, doSwap, async (req, res) => {
    const { message } = res.exchangeInfo
    res.send(message)
})

//
ROUTE.post('/send', canPay, usePayRoute, sendMoney, (req, res) => {
    const { method } = res.payInfo
    res.send(method)
})

ROUTE.post('/request', (req, res) => {
    res.send('TRANSACT WORKING Swap')
})

module.exports = ROUTE