const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const partyController = require("../../controllers/dashboard/partyController");

router.post("/party-add", authMiddleware, partyController.add_party);
router.put("/party-update", authMiddleware, partyController.update_party);
router.get("/parties-get", authMiddleware, partyController.get_parties);
router.get("/party-get/:partyId", authMiddleware, partyController.get_party);
router.get(
  "/payment-parties-get",
  authMiddleware,
  partyController.get_payment_parties
);
router.get(
  "/purchase-parties-get",
  authMiddleware,
  partyController.get_purchase_parties
);
router.get(
  "/account-type-parties",
  authMiddleware,
  partyController.account_type_parties
);

module.exports = router;
