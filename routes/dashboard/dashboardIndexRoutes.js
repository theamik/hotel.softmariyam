const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const {
  get_seller_dashboard_data,
  get_admin_dashboard_data,
} = require("../../controllers/dashboard/dashboardIndexController");
router.get(
  "/get-dashboard-index-data",
  authMiddleware,
  get_seller_dashboard_data
);

module.exports = router;
