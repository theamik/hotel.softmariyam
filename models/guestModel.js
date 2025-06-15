const { Schema, model, mongoose } = require("mongoose");

const guestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "available",
    },
    under: {
      type: String,
      default: "hotel",
    },
    count: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    programId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs",
      },
    ],
    reservationId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reservations",
      },
    ],
  },
  { timestamps: true }
);

guestSchema.index(
  {
    name: "text",
  },
  {
    weights: {
      name: 5,
    },
  }
);

module.exports = model("guests", guestSchema);
