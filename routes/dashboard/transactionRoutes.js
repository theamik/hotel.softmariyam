const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const transactionController = require("../../controllers/dashboard/transactionController");

router.post(
  "/payment-transaction",
  authMiddleware,
  transactionController.payment_transaction
);
router.post(
  "/receive-transaction",
  authMiddleware,
  transactionController.receive_transaction
);
router.post(
  "/contra-transaction",
  authMiddleware,
  transactionController.contra_transaction
);
router.post(
  "/party-ledger",
  authMiddleware,
  transactionController.party_ledger
);
router.post(
  "/income-statement",
  authMiddleware,
  transactionController.income_statement
);
router.post(
  "/account-type",
  authMiddleware,
  transactionController.account_type
);
router.post("/day-book", authMiddleware, transactionController.day_book);
router.post(
  "/balance-sheet",
  authMiddleware,
  transactionController.balance_sheet
);

module.exports = router;
