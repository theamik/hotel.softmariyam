const { Schema, model, mongoose } = require("mongoose");
const purchaseSchema = new Schema(
  {
    purchaseNo: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
    },
    purchaseForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parties",
    },
    generatedBy: {
      type: String,
      required: true,
    },
    cartItems: {
      type: Array,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("purchases", purchaseSchema);
