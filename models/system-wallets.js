const mongoose = require('mongoose')

const SystemWalletsSchema = new mongoose.Schema(
    {
        // system_id: { type: mongoose.Schema.Types.ObjectId, required: [true, "Wallet is pointing at which system?"], ref: "System" },
        name: {
            type: String,
            required: [true, "Wallet name is required!"]
        },
        code: {
            type: String,
            required: [true, "Wallet code is required!"],
            min: [3, "Code length mus be grt 3"],
            unique: [true, "Wallet with code already exists!!"]
        },
        symbol: {
            type: String,
            required: [true, "Wallet symbol is required!"],
        },
        useable: {
            type: Boolean,
            requried: [true, "Is this wallet disabled?"],
            default: false
        },
        fee: {
            type: Number,
            required: [true, "fee is required, 1 = %1"],
            default: 0
        },
        base_wallet: {
            type: Boolean,
            required: [true, "Is this a base wallet"],
            default: false
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('SystemWallet', SystemWalletsSchema)