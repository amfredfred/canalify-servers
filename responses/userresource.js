const userResource = (user = {}) => ({
    name: user?.name,
    userName: user?.username,
    email: user?.email,
    profilePic: user?.profile_pic,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    verified: user?.verified,
    privilege: user?.privillage
})

module.exports = userResource