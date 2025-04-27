const { Schema, model, mongoose } = require('mongoose');
const serviceSchema = new Schema({
    serviceNo: {
        type: Number,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies"
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "parties"
    },
    generatedBy: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    problem: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    station: {
        type: String,
        default: "In-house"
    },
    date: {
        type: Object,
        required: true
    },
    updateDate: {
        type: Object,
    },
}, { timestamps: true })

module.exports = model("services", serviceSchema);