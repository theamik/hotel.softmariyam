const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const roomController = require("../../controllers/dashboard/roomController");

router.post("/category-add", authMiddleware, roomController.add_category);
router.put("/category-update", authMiddleware, roomController.update_category);
router.get("/categories-get", authMiddleware, roomController.get_categories);
router.get(
  "/category-get/:categoryId",
  authMiddleware,
  roomController.get_category
);
router.post("/room-add", authMiddleware, roomController.add_room);
router.put("/room-update", authMiddleware, roomController.update_room);
router.get("/rooms-get", authMiddleware, roomController.get_rooms);
router.get(
  "/available-rooms-get",
  authMiddleware,
  roomController.get_available_rooms
);

router.get(
  "/available-rooms-get-for-edit",
  authMiddleware,
  roomController.get_available_rooms_for_edit
);
router.get(
  "/booked-rooms-get",
  authMiddleware,
  roomController.get_booked_rooms
);

router.get(
  "/booked-rooms-get-for-edit",
  authMiddleware,
  roomController.get_booked_rooms_for_edit
);
router.get("/room-get/:roomId", authMiddleware, roomController.get_room);
router.get("/out-rooms-get", authMiddleware, roomController.get_out_rooms);

module.exports = router;
