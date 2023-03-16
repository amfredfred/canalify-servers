const express = require('express')
const ROUTE = express.Router()
const User = require('../models/user-model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { findUser } = require('../middlewares/finduser')
if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()
    
//Get all users
ROUTE.get('', async (req, res) => {

})

//Get a user
ROUTE.get('/:id', findUser, async (req, res) => {
    const user_account = res.user
    console.log(user_account, 'USER E E DEDEDEMDEKDME DED')

    res.json({
        user: { ...user_account, password: 'lol 😒' },
        exists: Boolean(user_account),
        message: `User ${!Boolean(user_account) && "Not "} Found`
    })
})

//Create new user
ROUTE.post('/', findUser, async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10)
    const randid = String(crypto.randomBytes(20).toString('hex'))
    const username = req.body.username ?? randid.slice(0, 7).toUpperCase()
    const email = req.body.email
    const newUser = new User({ name: req.body.name, username, password, email })
    if (Boolean(res.user)) return res.status(400).json({
        message: "user already exists",
        exists: true
    })
    const [user] = await Promise.allSettled([newUser.save()])
    if (user.status === 'rejected') {
        return res.status(500).json({
            message: "something went wrong",
            error: user?.reason?.errors
        })
    }
    const accessToken = jwt.sign(newUser.username, process.env.ACCESS_TOKEN_SECRET)
    res.status(201).json({ accessToken })
})


//Login user
ROUTE.post('/login', async (req, res) => {

})

//Logout user
ROUTE.post('/logout', async (req, res) => {

})

//Patch user
ROUTE.post('/', async (req, res) => {

})

//Delete user

module.exports = ROUTE