const branchModel = require('../../models/branchModel');
const companyModel = require('../../models/companyModel');
const cloudinary = require('../../utils/cloudinaryConfig');
const { responseReturn } = require('../../utils/response')
const { formidable } = require('formidable');
const slugify = require("slugify");
const { mongo: { ObjectId } } = require('mongoose')

class companyController {
    add_company = async (req, res) => {

        const form = formidable()
        form.parse(req, async (err, fields, files) => {

            if (err) {
                responseReturn(res, 404, { error: 'something error' })
            } else {

                let { name, email, address, mobile, description } = fields
                let { image } = files
                let filepath = image.map((item) => item.filepath);
                let path = filepath.toString()
                const slug = slugify(name.toString(), { replacement: "-", lower: true })

                try {
                    const result = await cloudinary.uploader.upload(path, { folder: 'foodaleeza/company' })
                    if (result) {
                        const company = await companyModel.create({
                            name: name.toString(),
                            email: email.toString(),
                            address: address.toString(),
                            mobile: mobile.toString(),
                            description: description.toString(),
                            slug: slug,
                            image: result.url
                        })
                        responseReturn(res, 201, { company, message: 'Company added successfully' })
                    } else {
                        responseReturn(res, 404, { error: 'Image upload failed' })
                    }
                } catch (error) {
                    responseReturn(res, 500, { error: 'Internal server error' })
                }

            }
        })
    }

    update_company = async (req, res) => {
        const { companyId } = req.params
        const form = formidable()
        form.parse(req, async (err, fields, files) => {
            if (err) {
                responseReturn(res, 404, { error: 'something error' })
            } else {
                let { name, email, address, mobile, description } = fields
                let { image } = files
                const slug = slugify(name.toString(), { replacement: "-", lower: true })
                try {

                    if (image !== undefined) {
                        const available = await companyModel.findById(companyId)
                        let temp = available.image.split('/')
                        temp = temp[temp.length - 1]
                        const imageName = temp.split('.')[0]
                        await cloudinary.uploader.destroy(imageName)
                        let filepath = image.map((item) => item.filepath);
                        let path = filepath.toString()
                        const result = await cloudinary.uploader.upload(path, { folder: 'foodaleeza/company' })
                        if (result) {
                            const company = await companyModel.findByIdAndUpdate(companyId, {
                                name: name.toString(),
                                email: email.toString(),
                                address: address.toString(),
                                mobile: mobile.toString(),
                                description: description.toString(),
                                slug: slug,
                                image: result.url
                            })
                            responseReturn(res, 201, { company, message: 'Company updated successfully' })
                        } else {
                            responseReturn(res, 404, { error: 'Image upload failed' })
                        }
                    } else {
                        const company = await companyModel.findByIdAndUpdate(companyId, {
                            name: name.toString(),
                            email: email.toString(),
                            address: address.toString(),
                            mobile: mobile.toString(),
                            description: description.toString(),
                            slug: slug,
                        })
                        responseReturn(res, 201, { company, message: 'Company updated successfully' })
                    }
                } catch (error) {
                    responseReturn(res, 500, { error: 'Internal server error' })
                }

            }
        })
    }

    get_company = async (req, res) => {
        const { page, searchValue, parPage, status } = req.query
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && status && page && parPage) {
                const companies = await companyModel.find({
                    $text: { $search: searchValue }, status: status
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 })
                //console.log(companies)
                const totalCompany = await companyModel.find({
                    $text: { $search: searchValue }, status: status
                }).countDocuments()
                //console.log(totalCompany)
                responseReturn(res, 200, { totalCompany, companies })
            } else if (searchValue && status === "" && page && parPage) {
                const companies = await companyModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 })
                //console.log(companies)
                const totalCompany = await companyModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalCompany)
                responseReturn(res, 200, { totalCompany, companies })
            }
            else if (searchValue === '' && status && page && parPage) {
                const companies = await companyModel.find({ status: status }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalCompany = await companyModel.find({ status: status }).countDocuments()
                responseReturn(res, 200, { totalCompany, companies })
            } else if (searchValue === '' && status === '' && page && parPage) {
                const companies = await companyModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalCompany = await companyModel.find({}).countDocuments()
                responseReturn(res, 200, { totalCompany, companies })
            }
            else {
                const companies = await companyModel.find({}).sort({ createdAt: -1 })
                const totalCompany = await companyModel.find({}).countDocuments()
                responseReturn(res, 200, { totalCompany, companies })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    set_status = async (req, res) => {
        const { status, companyId } = (req.body)

        try {
            await companyModel.findByIdAndUpdate(companyId, {
                status
            })
            const company = await companyModel.findById(companyId)
            responseReturn(res, 201, { company, message: 'Company status updated successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    get_a_company = async (req, res) => {
        const { companyId } = req.params
        try {
            const company = await companyModel.findById(companyId)
            responseReturn(res, 201, { company })
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }
    add_branch = async (req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            let { name, address, email, mobile, description, company } = field;
            const slug = slugify(name.toString(), { replacement: "-", lower: true })

            try {


                const branch = await branchModel.create({
                    name: name.toString(),
                    slug,
                    address: address.toString(),
                    email: email.toString(),
                    mobile: mobile.toString(),
                    description: description.toString(),
                    companyId: company.toString()
                })
                responseReturn(res, 201, { message: "Branch added successfully" })
            } catch (error) {
                responseReturn(res, 500, { error: error.message })
            }

        })
    }

    get_branch = async (req, res) => {
        const { page, searchValue, parPage, status } = req.query
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && status && page && parPage) {
                const branches = await branchModel.find({
                    $text: { $search: searchValue }, status: status
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId')
                //console.log(branches)
                const totalBranch = await branchModel.find({
                    $text: { $search: searchValue }, status: status
                }).countDocuments()
                //console.log(totalBranch)
                responseReturn(res, 200, { totalBranch, branches })
            } else if (searchValue && status === "" && page && parPage) {
                const branches = await branchModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ updatedAt: -1 }).populate('companyId')
                //console.log(branches)
                const totalBranch = await branchModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalBranch)
                responseReturn(res, 200, { totalBranch, branches })
            }
            else if (searchValue === '' && status && page && parPage) {
                const branches = await branchModel.find({ status: status }).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId')
                const totalBranch = await branchModel.find({ status: status }).countDocuments()
                responseReturn(res, 200, { totalBranch, branches })
            } else if (searchValue === '' && status === '' && page && parPage) {
                const branches = await branchModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1 }).populate('companyId')
                const totalBranch = await branchModel.find({}).countDocuments()
                responseReturn(res, 200, { totalBranch, branches })
            }
            else {
                const branches = await companyModel.find({}).sort({ createdAt: -1 }).populate('companyId')
                const totalBranch = await companyModel.find({}).countDocuments()
                responseReturn(res, 200, { totalBranch, branches })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    get_company_branch = async (req, res) => {
        const { companyId } = req.params
        try {
            const companyBranch = await branchModel.find({ companyId: companyId }).populate('companyId')
            const totalCompanyBranch = await branchModel.find({ companyId: companyId }).countDocuments()
            responseReturn(res, 201, { companyBranch, totalCompanyBranch })
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    set_branch_status = async (req, res) => {
        const { status, branchId } = (req.body)

        try {
            await branchModel.findByIdAndUpdate(branchId, {
                status
            })
            const branch = await branchModel.findById(branchId)
            responseReturn(res, 201, { branch, message: 'Company status updated successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }
    update_branch = async (req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            let { name, address, email, mobile, description, company, id } = field;
            const branchId = id.toString();
            const companyId = company.toString();
            const slug = slugify(name.toString(), { replacement: "-", lower: true })

            try {

                if (companyId === '') {
                    const branch = await branchModel.findByIdAndUpdate(branchId, {
                        name: name.toString(),
                        slug,
                        address: address.toString(),
                        email: email.toString(),
                        mobile: mobile.toString(),
                        description: description.toString(),
                    })
                    responseReturn(res, 201, { branch, message: 'Branch updated successfully' })
                } else {
                    const branch = await branchModel.findByIdAndUpdate(branchId, {
                        name: name.toString(),
                        slug,
                        address: address.toString(),
                        email: email.toString(),
                        mobile: mobile.toString(),
                        description: description.toString(),
                        companyId: companyId
                    })
                    responseReturn(res, 201, { branch, message: 'Branch updated successfully' })
                }
            } catch (error) {
                responseReturn(res, 500, { error: error.message })
            }

        })
    }

    get_a_branch = async (req, res) => {
        const { branchId } = req.params
        try {
            const branch = await branchModel.findById(branchId).populate('companyId')
            responseReturn(res, 201, { branch })
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

}
module.exports = new companyController()