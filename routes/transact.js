const express = require('express')
const bcrypt = require('bcrypt')
const { canSwap, doSwap, exchangeRate } = require('../middlewares/swap')
const { authenticated } = require('../middlewares/authenticated')
const ROUTE = express.Router()


//
ROUTE.get('/', (req, res) => {
    res.send('TRANSACT WORKING')
})

//
ROUTE.post('/swap', authenticated, canSwap, exchangeRate, doSwap, async (req, res) => {

    res.send({ message: 'TRANSACT WORKING Swap', ot: res.exchangeInfo })
})

//
ROUTE.post('/send', (req, res) => {
    res.send('TRANSACT WORKING Swap')
})

ROUTE.post('/request', (req, res) => {
    res.send('TRANSACT WORKING Swap')
})

module.exports = ROUTE