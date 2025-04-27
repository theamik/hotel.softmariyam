const { Schema, model } = require('mongoose')

const ownerAdminSchema = new Schema({
    myId: {
        type: String,
        required: true
    },
    myFriends: {
        type: Array,
        default: []
    }

}, { timestamps: true })

module.exports = model('owner_admins', ownerAdminSchema)