const { Schema, model, mongoose } = require("mongoose");
const draftSchema = new Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches",
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
      required: true,
    },
    service: {
      type: Number,
      default: 0,
    },
    delivery: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Object,
      required: true,
    },
    remark: {
      // Added remark field
      type: String,
      default: "", // Optional, provide a default empty string
    },
  },
  { timestamps: true }
);

module.exports = model("drafts", draftSchema);
