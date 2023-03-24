const mongoose = require('mongoose')

const TransferMethodsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    countries: { type: Array, required: true, default: ["all", "*"] },
    active: { type: Boolean, required: true, default: true },
    description: { type: String },
    code: { type: String, unique: true },
    wallets_for: { type: Array, required: true, default: ["all", "*"] },
    fee: { type: Number, required: true, default: 0.2 }
}, { timestamps: true })

module.exports = mongoose.model('TransferMethods', TransferMethodsSchema)