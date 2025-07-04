const router = require("express").Router();
const orderController = require("../../controllers/order/orderController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

router.get("/order/get-parties", authMiddleware, orderController.get_parties);
router.post("/order/make-draft", authMiddleware, orderController.make_draft);
router.get(
  "/order/get-company-drafts",
  authMiddleware,
  orderController.get_company_drafts
);
router.get("/order/get-draft/:preOrderId", orderController.get_draft);
router.delete(
  "/order/remove-draft/:preOrderId/:partyId",
  orderController.remove_draft
);

router.post("/order/place-order", authMiddleware, orderController.place_order);
router.get(
  "/order/get-company-orders",
  authMiddleware,
  orderController.get_company_orders
);
router.get(
  "/order/get-company-order/:orderId",
  orderController.get_company_order
);

router.put(
  "/order/update-status/:orderId",
  authMiddleware,
  orderController.update_order_status
);
router.delete("/order/cancel-order/:orderId", orderController.cancel_order);

router.post("/order/new-program", authMiddleware, orderController.new_program);
router.get("/order/all-programs", authMiddleware, orderController.all_programs);
router.get(
  "/order/get-a-program/:programId",
  authMiddleware,
  orderController.get_a_program
);
router.put(
  "/order/update-program",
  authMiddleware,
  orderController.update_program
);

router.delete(
  "/order/cancel-program/:programId",
  orderController.cancel_program
);
router.post(
  "/order/new-reservation",
  authMiddleware,
  orderController.new_reservation
);
router.get(
  "/order/reservations-get",
  authMiddleware,
  orderController.all_reservations
);

router.get(
  "/order/group-reservations-get",
  authMiddleware,
  orderController.group_reservations
);

router.get(
  "/order/get-a-reservation/:reservationId",
  authMiddleware,
  orderController.get_a_reservation
);

router.put(
  "/order/update-reservation-status/:reservationId",
  authMiddleware,
  orderController.update_reservation_status
);

router.put(
  "/order/update-reservation",
  authMiddleware,
  orderController.update_reservation
);

router.get(
  "/order/reservations-by-date-status",
  authMiddleware,
  orderController.getReservationsByDateAndStatus
);

router.get(
  "/order/reservations-by-date-status-stay-view",
  authMiddleware,
  orderController.getReservationsByDateAndStatusStayView
);

module.exports = router;
