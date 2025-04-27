const { Schema, model, mongoose } = require('mongoose')

const inventorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies"
    },
}, { timestamps: true })

inventorySchema.index({
    name: 'text'
})

module.exports = model('inventories', inventorySchema)