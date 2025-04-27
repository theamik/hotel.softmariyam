const router = require('express').Router()
const { authMiddleware } = require('../../middlewares/authMiddleware')
const ownerController = require('../../controllers/dashboard/ownerController')

router.get('/request-owner-get',authMiddleware,ownerController.get_owner_request)

router.get('/get-owners',authMiddleware,ownerController.get_active_owners)
router.get('/get-deactive-owners',authMiddleware,ownerController.get_deactive_owners)

router.get('/get-owner/:ownerId',authMiddleware,ownerController.get_owner)
router.post('/owner-status-update',authMiddleware,ownerController.owner_status_update)
router.put('/owner-company',authMiddleware,ownerController.owner_company)

module.exports = router