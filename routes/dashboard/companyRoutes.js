const router = require('express').Router()
const { authMiddleware } = require('../../middlewares/authMiddleware')
const companyController = require('../../controllers/dashboard/companyController')

router.post('/company-add', authMiddleware, companyController.add_company)
router.put('/company-update/:companyId', authMiddleware, companyController.update_company)
router.get('/company-get', authMiddleware, companyController.get_company)
router.get('/a-company-get/:companyId', authMiddleware, companyController.get_a_company)
router.put('/company-status', authMiddleware, companyController.set_status)
router.post('/branch-add', authMiddleware, companyController.add_branch)
router.put('/branch-update', authMiddleware, companyController.update_branch)
router.get('/branch-get', authMiddleware, companyController.get_branch)
router.get('/company-branch/:companyId', authMiddleware, companyController.get_company_branch)
router.put('/branch-status', authMiddleware, companyController.set_branch_status)
router.get('/a-branch-get/:branchId', authMiddleware, companyController.get_a_branch)

module.exports = router