const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema(
    {
        wallet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: [true, "transaction must belong to a wallet!"]
        },
        fee: {
            type: Number,
            default: null
        },
        transaction_type: {
            type: String,
            required: [true, "transaction type is required!"]
        },
        confirmed: {
            type: Boolean,
            default: true,
        },
        amount: {
            type: Number,
            required: [true, 'transaction amount is requried!']
        },
        transaction_id: {
            type: String,
            unique: [true, "seems this transaction already exists!"],
            required: [true, "each transaction must be asigned an id!"],
        },
        from: {
            type: String,
            required: [true, "where are you sending funds from?"]
        },
        to: {
            type: String,
            required: [true, "where are you sending funds to?"]
        },
        status: {
            type: String,
            required: [true, "what is the transaction status?"],
            default: "PENDING"
        },
        created_at: {
            type: Date,
            required: [true, "creation time required!"],
            default: Date.now
        },
        updated_at: {
            type: Date,
            required: [true, "update time required!"],
            default: Date.now
        },
        remarks: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
)


module.exports = mongoose.model('Transaction', TransactionSchema)