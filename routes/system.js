const express = require('express')
const ROUTE = express.Router()
const System = require('../models/system')
const SystemWallet = require('../models/system-wallets')
const { hasPrivileges, usePrivileges } = require('../middlewares/privilage')
const { authenticated } = require('../middlewares/authenticated')

//Get All System Configs
ROUTE.get('', authenticated, hasPrivileges, usePrivileges, async (req, res) => {
    res.json(res.userinfo)
})




module.exports = ROUTE