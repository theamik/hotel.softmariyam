const { Schema, model } = require('mongoose')

const staffOwnerSchema = new Schema({
    myId: {
        type: String,
        required: true
    },
    myFriends: {
        type: Array,
        default: []
    }

}, { timestamps: true })

module.exports = model('staff_owners', staffOwnerSchema)