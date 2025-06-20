const { Schema, model, mongoose } = require("mongoose");
const orderSchema = new Schema(
  {
    orderNo: {
      type: Number,
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
    party: {
      type: String,
      required: true,
    },
    partyId: {
      type: String,
      required: true,
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
    discount: {
      type: Number,
      default: 0,
    },
    delivery: {
      type: Number,
      default: 0,
    },
    service: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      required: true,
    },
    remark: {
      // Added remark field
      type: String,
      default: "", // Optional, provide a default empty string
    },
    status: {
      type: String,
      default: "due",
    },
  },
  { timestamps: true }
);

module.exports = model("orders", orderSchema);
