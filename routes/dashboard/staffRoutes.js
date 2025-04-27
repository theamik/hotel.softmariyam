const router = require('express').Router()
const { authMiddleware } = require('../../middlewares/authMiddleware')
const staffController = require('../../controllers/dashboard/staffController')

router.get('/request-staff-get',authMiddleware,staffController.get_staff_request)

router.get('/get-staffs',authMiddleware,staffController.get_active_staffs)
router.get('/get-company-staffs',authMiddleware,staffController.get_company_staffs)
router.get('/get-deactive-staffs',authMiddleware,staffController.get_deactive_staffs)

router.get('/get-staff/:staffId',authMiddleware,staffController.get_staff)
router.post('/staff-status-update',authMiddleware,staffController.staff_status_update)
router.put('/staff-company',authMiddleware,staffController.staff_company)
router.put('/staff-branch',authMiddleware,staffController.staff_branch)


module.exports = router