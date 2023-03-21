const mongoose = require('mongoose')

const WalletScheme = new mongoose.Schema(
    {
        user_id: {
            required: [true, "wallet owner is required!"],
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        transactions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        }],
        symbol: {
            type: String,
            required: [true, "wallet symbol is required!"],
        },
        code: {
            type: String,
            required: [true, "wallet code is required!"],
            unique: true,
        },
        name: {
            type: String,
            required: [true, "wallet name is required!"],
        },
        base_wallet: {
            type: Boolean,
            default: true,
        },
        active: {
            type: Boolean,
            default: true
        },
        balance_before: {
            type: Number,
            default: null
        },
        balance_after: {
            type: Number,
            default: null
        },
        balance_as_base: {
            type: Number,
            default: null
        },
        rate: {
            type: Number,
            default: 1
        }
    },
    { timestamps: true }
)


module.exports = mongoose.model("Wallet", WalletScheme)