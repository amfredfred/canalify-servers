const mongoose = require('mongoose')

const SystemSchema = new mongoose.Schema({
    system_wallets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
})


module.exports = mongoose.model('System', SystemSchema)