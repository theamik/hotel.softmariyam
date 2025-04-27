const mongoose = require('mongoose')

module.exports.dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_LOC_URL, {
            useNewURLParser: true
        })
        console.log(`database connected with ${process.env.DB_LOC_URL}`)
    } catch (error) {
        console.log(error.message)
    }
}