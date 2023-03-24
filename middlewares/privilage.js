const userResource = require('../responses/userresource')
const { walletCollection } = require('../responses/walletresource')
const System = require('../models/system')
const SystemWallet = require('../models/system-wallets')
const User = require('../models/user-model')
const Wallet = require('../models/wallet-model')


async function hasPrivileges(req, res, next) {
    const { userId } = res.account
    const [account] = await Promise.allSettled([User.findOne({ _id: userId })])

    if (account.status === 'rejected') return res.status(500)
        .send('PRIVILLAGE: something went wrong')

    if (!Boolean(account?.value)) return res.status(404)
        .send("PRIVILLAGE: null user")

    const Privileges = userResource(account.value).privilege
    res.privilege = Privileges
    next()
}


async function usePrivileges(req, res, next) {

    res.privilege = res.privilege
    const Role = res.privilege ?? []

    const [sysWallets, sysSettings, user, userWallet] = await Promise.allSettled([
        SystemWallet.find({}),
        System.find({}),
        User.findOne({ _id: res.account.userId }),
        Wallet.find({ user_id: res.account.userId })
    ])

    if (sysWallets.status === 'rejected') { }
    if (sysSettings.status === 'rejected') { }
    if (user.status === 'rejected') { }

    const systemWallets = walletCollection(sysWallets?.value)
    const userProfiler = userResource(user?.value)
    const userWallets = walletCollection(userWallet?.value)

    if (Role.includes("USER")) {
        const myWallets = []
        const waCode = []
        const AUUW = userWallets?.concat(systemWallets ?? [])
        AUUW?.flatMap(W => {
            if (W?.useable === false) return
            if (W?.isActive !== undefined && W?.useable === undefined) {
                if (W?.isActive) myWallets.unshift(W)
                else myWallets.push(W)
                waCode.push(W?.code)
                return
            }
            if (W?.isActive === undefined)
                if (W?.useable && !waCode.includes(W?.code)) myWallets.push(W)
        })

        res.userinfo = {
            sys: { settings: sysSettings?.value },
            profile: { ...userProfiler, wallets: myWallets, authenticated: true },
            message: "Authentication Successful!"
        }
    }

    if (Role.includes("SUPER_ADMIN")) {

    }
    if (Role.includes("ADMIN")) {

    }
    if (Role.includes("MODRATOR")) {

    }
    if (Role.includes("SUPPORT")) {

    }
    if (Role.includes("SUPPORT")) {

    }

    next()
}



module.exports.hasPrivileges = hasPrivileges
module.exports.usePrivileges = usePrivileges
