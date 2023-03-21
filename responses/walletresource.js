const walletResource = (wallet = {}) => ({
    name: wallet?.name,
    symbol: wallet?.symbol,
    isBaseWallet: wallet?.base_wallet,
    isActive: wallet?.active,
    balanceAsBase: wallet?.balance_as_base,
    balanceBefore: wallet?.balance_before,
    balanceAfter: wallet?.balance_after,
    rate: wallet?.rate,
    code: wallet?.code,
    useable: wallet?.useable,
    transactionCount: wallet?.transactions?.lenght,
})

const walletCollection = (wallets = []) => wallets.map(wallet => walletResource(wallet))

module.exports.walletCollection = walletCollection
module.exports.walletResource = walletResource

//@idevfred