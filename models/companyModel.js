const { Schema, model } = require('mongoose');
const companySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter company name!']
    },
    slug: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
        required: [true, 'Please enter company address!'],
    },
    mobile: {
        type: String,
        required: [true, 'Please enter company mobile number!'],
        minLength: [11, 'Mobile number must be at least 11 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please enter company description!'],
    },
    status: {
        type: String,
        default: 'Pending'
    },
    image: {
        type: String,
        required: [true, 'Please enter your image!']
    },
    division: {
        type: String,
    },
    district: {
        type: String,
    },
    sub_district: {
        type: String,
    },
    police_station: {
        type: String,
    },
    post_code: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

companySchema.index({
    name: 'text',
    mobile: 'text',    
    status: 'text'
}, {
    weights: {
        name: 5,
        mobile: 4,
        status: 5,
    }
})

module.exports = model("companies", companySchema);