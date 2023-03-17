const express = require('express')
const ROUTE = express.Router()
const User = require('../models/user-model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const userResource = require('../responses/userresource')

const { findUser } = require('../middlewares/finduser')
const { authenticated } = require('../middlewares/authenticated')


if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()
//Get all users
ROUTE.get('', async (req, res) => {

})

//Get a user
ROUTE.get('/:id', findUser, async (req, res) => {
    const user_account = res.user
    const user = userResource(user_account)
    res.json({
        user: Boolean(user_account) ? user : null,
        exists: Boolean(user_account),
        message: `User ${!Boolean(user_account) ? "Not" : ''} Found`
    })
})

//Create new user
ROUTE.post('/', findUser, async (req, res) => {
    let { password: psw, username: usn, email: em, name } = req.body
    if (!Boolean(psw)) return res.status(406).json({ message: 'password field is required' })
    
    const password = await bcrypt.hash(psw, 10)
    const randid = String(crypto.randomBytes(20).toString('hex'))
    const username = (usn ?? randid.slice(0, 7)).toUpperCase()
    const email = em.toUpperCase()
    const newUser = new User({ name, username, password, email })
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
    const accessToken = jwt.sign({
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email
    }, process.env.ACCESS_TOKEN_SECRET)
    res.status(201).json({ accessToken })
})


//Login user
ROUTE.post('/login', findUser, async (req, res) => {
    const user_account = res.user
    const user = userResource(user_account)
    if (!Boolean(user_account)) {
        return res.status(404).json({ exists: false, user: user_account, message: 'user not found' })
    }
    const phraseVerified = await bcrypt.compare(req.body.password, user_account.password)
    if (phraseVerified !== true) {
        return res.status(403).json({
            message: "please check your credentials"
        })
    }
    const accessToken = jwt.sign({
        userId: user_account._id,
        username: user_account.username,
        email: user_account.email
    }, process.env.ACCESS_TOKEN_SECRET)

    res.json({ accessToken, user, message: 'authenticaton successful!!' })
})

//Logout user
ROUTE.post('/logout', authenticated, async (req, res) => {
    const user = res.account
    res.json({ user, message: 'AUTHENTICATED: LOLO' })
})

//Patch user
ROUTE.post('/', async (req, res) => {

})

//Delete user

module.exports = ROUTE