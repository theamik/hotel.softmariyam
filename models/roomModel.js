const { Schema, model, mongoose } = require("mongoose");

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    checkIn: {
      type: String,
      required: false,
    },
    checkOut: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "Pending",
    },
    reservationId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
  },
  { timestamps: true }
);

roomSchema.index(
  {
    name: "text",
  },
  {
    weights: {
      name: 5,
    },
  }
);

module.exports = model("rooms", roomSchema);
