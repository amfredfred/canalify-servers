const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, },
        password: { type: String, required: true },
        verified: { type: Boolean, required: true, default: false },
        profile_pic: { type: String, default: null },
        privillage: { type: Array, default: ['USER'] },
        wallets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }],
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)