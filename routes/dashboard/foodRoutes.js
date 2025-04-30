const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const foodController = require("../../controllers/dashboard/foodController");

router.post("/food-add", authMiddleware, foodController.add_menu);
router.put("/menu-update", authMiddleware, foodController.update_menu);
router.get("/menus-get", authMiddleware, foodController.get_menus);
router.get("/menu-get/:menuId", authMiddleware, foodController.get_menu);
router.post("/food-add", authMiddleware, foodController.add_food);
router.put("/food-update", authMiddleware, foodController.update_food);
router.get("/foods-get", authMiddleware, foodController.get_foods);
router.get("/food-get/:foodId", authMiddleware, foodController.get_food);
router.get("/menu-foods/:menuId", authMiddleware, foodController.menu_foods);
router.get("/out-foods-get", authMiddleware, foodController.get_out_foods);
router.post("/table-add", authMiddleware, foodController.add_table);
router.put("/table-update", authMiddleware, foodController.update_table);
router.get("/tables-get", authMiddleware, foodController.get_tables);
router.get("/table-get/:tableId", authMiddleware, foodController.get_table);
router.post("/guest-add", authMiddleware, foodController.add_guest);
router.put("/guest-update", authMiddleware, foodController.update_guest);
router.get("/guests-get", authMiddleware, foodController.get_guests);
router.get("/guest-get/:guestId", authMiddleware, foodController.get_guest);

module.exports = router;
