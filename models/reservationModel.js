const { Schema, model, mongoose } = require("mongoose");

const reservationModel = new Schema(
  {
    reservationNo: {
      type: Number,
      unique: true,
      required: true, // Making it required as it's a primary identifier
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches",
      default: null,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
      required: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "guests",
      required: true,
    },
    generatedBy: {
      type: String,
      required: true,
    },
    // REVERTED: roomDetails is now an array of objects again
    roomDetails: [
      {
        _id: false, // Prevents Mongoose from creating _id for subdocuments if not explicitly needed
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "rooms",
          required: true,
        },
        rackRate: {
          type: Number,
          required: true,
        },
        discountRate: {
          type: Number,
          default: 0,
        },
        category: {
          type: String,
          required: true,
        },
        dayStay: {
          type: Number,
          required: true,
        },
        // Optional: If you want to track individual check-in/out for each room in a group reservation
        // checkInDate: { type: String },
        // checkOutDate: { type: String },
      },
    ],

    // Keeping 'others' and 'restaurants' as single objects as previously discussed,
    // assuming they are for the *primary* service or a single additional service for the whole reservation.
    // If you need multiple, distinct 'other' or 'restaurant' charges per reservation,
    // these would also need to be arrays of sub-objects. For now, keeping as objects.
    others: [
      {
        other: { type: String },
        otherAmount: { type: Number },
      },
    ],
    restaurants: [
      {
        restaurant: { type: String },
        restaurantAmount: { type: Number },
      },
    ],

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
    paidInfo: {
      type: Array,
      default: [],
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
    source: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "will_check",
      enum: ["checked_in", "checked_out", "will_check", "cancel"],
    },
    remark: {
      type: String,
      default: "",
    },
    billTransfer: {
      type: mongoose.Schema.Types.ObjectId, // Storing the roomId for transfer
      ref: "rooms",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = model("reservations", reservationModel);
