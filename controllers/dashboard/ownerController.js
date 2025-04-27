const ownerModel = require('../../models/ownerModel')
const { responseReturn } = require('../../utils/response')

class ownerController {

    get_owner_request = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        const skipPage = parseInt(parPage) * (parseInt(page) - 1)

        try {
            if (searchValue) {
                //const owner
                const owners = await ownerModel.find({ status: 'Pending' }).find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId')
                const totalOwners = await ownerModel.find({ status: 'Pending' }).countDocuments()
                responseReturn(res, 200, { totalOwners, owners })
            } else {
                const owners = await ownerModel.find({ status: 'Pending' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalOwners = await ownerModel.find({ status: 'Pending' }).countDocuments()
                responseReturn(res, 200, { totalOwners, owners })
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    get_owner = async (req, res) => {
        const { ownerId } = req.params

        try {
            const owner = await ownerModel.findById(ownerId).populate('companyId');
            responseReturn(res, 200, { owner })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    owner_company = async (req, res) => {
        const { ownerId, companyId } = req.body
        try {
            await ownerModel.findByIdAndUpdate(ownerId, {
                companyId
            })
            const owner = await ownerModel.findById(ownerId)
            responseReturn(res, 200, { owner, message: 'Owner company set successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    owner_status_update = async (req, res) => {
        const { ownerId, status } = req.body
        try {
            await ownerModel.findByIdAndUpdate(ownerId, {
                status
            })
            const owner = await ownerModel.findById(ownerId)
            responseReturn(res, 200, { owner, message: 'Owner status updated' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_active_owners = async (req, res) => {
        let { page, searchValue, parPage,status } = req.query
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && status && page && parPage) {
                const owners = await ownerModel.find({
                    $text: { $search: searchValue }, status: status
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId')
                //console.log(owners)
                const totalOwners = await ownerModel.find({
                    $text: { $search: searchValue }, status: status
                }).countDocuments()
                //console.log(totalOwners)
                responseReturn(res, 200, { totalOwners, owners })
            } else if (searchValue && status === "" && page && parPage) {
                const owners = await ownerModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId')
                //console.log(owners)
                const totalOwners = await ownerModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalOwners)
                responseReturn(res, 200, { totalOwners, owners })
            }
            else if (searchValue === '' && status && page && parPage) {
                const owners = await ownerModel.find({ status: status }).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId')
                const totalOwners = await ownerModel.find({ status: status }).countDocuments()
                responseReturn(res, 200, { totalOwners, owners })
            } else if (searchValue === '' && status === '' && page && parPage) {
                const owners = await ownerModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId')
                const totalOwners = await ownerModel.find({}).countDocuments()
                responseReturn(res, 200, { totalOwners, owners })
            }
            else {
                const owners = await ownerModel.find({}).sort({ createdAt: -1 })
                const totalOwners = await ownerModel.find({}).countDocuments()
                responseReturn(res, 200, { totalOwners, owners })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    get_deactive_owners = async (req, res) => {
        let { page, searchValue, parPage } = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                const owners = await ownerModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

                const totalOwner = await ownerModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).countDocuments()

                responseReturn(res, 200, { totalOwner, owners })
            } else {
                const owners = await ownerModel.find({ status: 'deactive' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalOwner = await ownerModel.find({ status: 'deactive' }).countDocuments()
                responseReturn(res, 200, { totalOwner, owners })
            }

        } catch (error) {
            console.log('active owner get ' + error.message)
        }
    }
}

module.exports = new ownerController()