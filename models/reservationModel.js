const { Schema, model, mongoose } = require("mongoose");
const programModel = new Schema(
  {
    reservationNo: {
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
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "residents",
    },
    generatedBy: {
      type: String,
      required: true,
    },
    roomId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
      },
    ],
    others: {
      type: Array,
    },
    restaurant: {
      type: Array,
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
    checkInDate: {
      type: String,
      required: true,
    },
    checkOutDate: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "will_check",
    },
  },
  { timestamps: true }
);

module.exports = model("programs", programModel);
