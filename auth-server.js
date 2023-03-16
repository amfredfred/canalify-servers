const express = require('express')
const app = express()
const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()

/* middlewares */
app.use(express.json())

/* Authentication route */
app.use('/users', require('./routes/authentication'))


//DB connection with mongoose
mongoose.connect(process.env.DB_URL)
const DB = mongoose.connection
DB.on('error', (error) => console.log("ERROR DB CONNECTION: ", error))
DB.once('open', () => console.log("SUCCESSFUl DB CONNECTION "))






//
app.listen(process.env.AUTH_PORT || 2000)