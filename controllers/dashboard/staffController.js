const staffModel = require('../../models/staffModel')
const { responseReturn } = require('../../utils/response')
const ownerModel = require('../../models/ownerModel')
class staffController {
    
    get_staff_request = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        const skipPage = parseInt(parPage) * (parseInt(page) - 1)
        try {
            if (searchValue) {
                //const staff
            } else {
                const staffs = await staffModel.find({ status: 'Pending' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalStaff = await staffModel.find({ status: 'Pending' }).countDocuments()
                responseReturn(res, 200, { totalStaff, staffs })
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    get_staff = async (req, res) => {
        const { staffId } = req.params

        try {
            const staff = await staffModel.findById(staffId).populate('companyId').populate('branchId').populate('branchId')
            responseReturn(res, 200, { staff })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    staff_company = async (req, res) => {
        const { staffId, companyId } = req.body
        try {
            await staffModel.findByIdAndUpdate(staffId, {
                companyId
            })
            const staff = await staffModel.findById(staffId)
            responseReturn(res, 200, { staff, message: 'Staff company set successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    staff_branch = async (req, res) => {
        const { staffId, branchId } = req.body
        try {
            await staffModel.findByIdAndUpdate(staffId, {
                branchId
            })
            const staff = await staffModel.findById(staffId)
            responseReturn(res, 200, { staff, message: 'Staff branch set successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    staff_status_update = async (req, res) => {
        const { staffId, status } = req.body
        try {
            await staffModel.findByIdAndUpdate(staffId, {
                status
            })
            const staff = await staffModel.findById(staffId)
            responseReturn(res, 200, { staff, message: 'Staff status update success' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_active_staffs = async (req, res) => {
        let { page, searchValue, parPage,status } = req.query
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && status && page && parPage) {
                const staffs = await staffModel.find({
                    $text: { $search: searchValue }, status: status
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId').populate('branchId')
                //console.log(staffs)
                const totalStaffs = await staffModel.find({
                    $text: { $search: searchValue }, status: status
                }).countDocuments()
                //console.log(totalStaffs)
                responseReturn(res, 200, { totalStaffs, staffs })
            } else if (searchValue && status === "" && page && parPage) {
                const staffs = await staffModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId').populate('branchId')
                //console.log(staffs)
                const totalStaffs = await staffModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalStaffs)
                responseReturn(res, 200, { totalStaffs, staffs })
            }
            else if (searchValue === '' && status && page && parPage) {
                const staffs = await staffModel.find({ status: status }).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId').populate('branchId')
                const totalStaffs = await staffModel.find({ status: status }).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            } else if (searchValue === '' && status === '' && page && parPage) {
                const staffs = await staffModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId').populate('branchId')
                const totalStaffs = await staffModel.find({}).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            }
            else {
                const staffs = await staffModel.find({}).sort({ createdAt: -1 })
                const totalStaffs = await staffModel.find({}).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    get_deactive_staffs = async (req, res) => {
        let { page, searchValue, parPage } = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                const staffs = await staffModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

                const totalStaff = await staffModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).countDocuments()

                responseReturn(res, 200, { totalStaff, staffs })
            } else {
                const staffs = await staffModel.find({ status: 'deactive' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalStaff = await staffModel.find({ status: 'deactive' }).countDocuments()
                responseReturn(res, 200, { totalStaff, staffs })
            }

        } catch (error) {
            console.log('active staff get ' + error.message)
        }
    }

    get_company_staffs = async (req, res) => {
        const { id } = req;
        let { page, searchValue, parPage,status } = req.query
        const { companyId } = await ownerModel.findById(id);
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && status && page && parPage) {
                const staffs = await staffModel.find({
                    $text: { $search: searchValue }, status: status, companyId:companyId
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId').populate('branchId')
                //console.log(staffs)
                const totalStaffs = await staffModel.find({
                    $text: { $search: searchValue }, status: status, companyId:companyId
                }).countDocuments()
                //console.log(totalStaffs)
                responseReturn(res, 200, { totalStaffs, staffs })
            } else if (searchValue && status === "" && page && parPage) {
                const staffs = await staffModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId').populate('branchId')
                //console.log(staffs)
                const totalStaffs = await staffModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalStaffs)
                responseReturn(res, 200, { totalStaffs, staffs })
            }
            else if (searchValue === '' && status && page && parPage) {
                const staffs = await staffModel.find({ status: status, companyId:companyId }).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId').populate('branchId')
                const totalStaffs = await staffModel.find({ status: status, companyId:companyId }).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            } else if (searchValue === '' && status === '' && page && parPage) {
                const staffs = await staffModel.find({companyId:companyId}).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId').populate('branchId')
                const totalStaffs = await staffModel.find({companyId:companyId}).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            }
            else {
                const staffs = await staffModel.find({}).sort({ createdAt: -1 })
                const totalStaffs = await staffModel.find({}).countDocuments()
                responseReturn(res, 200, { totalStaffs, staffs })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

}

module.exports = new staffController()