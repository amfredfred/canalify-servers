const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
app.use(express.json())


/* Transact route */
app.use('/transact', require('./routes/transact'))


//DB connection with mongoose
mongoose.connect(process.env.DB_URL)
const DB = mongoose.connection
DB.on('error', (error) => console.log("ERROR DB CONNECTION: ", error))
DB.once('open', () => console.log("SUCCESSFUl DB CONNECTION "))


app.listen(1005)