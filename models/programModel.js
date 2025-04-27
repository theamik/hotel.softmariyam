const { Schema, model, mongoose } = require("mongoose");
const programModel = new Schema(
  {
    programNo: {
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
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "guests",
    },
    generatedBy: {
      type: String,
      required: true,
    },
    foodItems: {
      type: Array,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalGuest: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    hallCharge: {
      type: Number,
      default: 0,
    },
    decoration: {
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
    due: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Array,
    },
    bookedDate: {
      type: String,
      required: true,
    },
    programDate: {
      type: String,
      required: true,
    },
    hall: {
      type: String,
      required: true,
    },
    programType: {
      type: String,
      required: true,
    },
    perHead: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    season: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = model("programs", programModel);
