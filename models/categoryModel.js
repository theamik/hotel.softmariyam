const { Schema, model, mongoose } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    occupancy: {
      type: String,
      required: true,
    },
    rackRate: {
      type: String,
      required: true,
    },
    discountRate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    roomId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
      },
    ],
  },
  { timestamps: true }
);

categorySchema.index({
  name: "text",
});

module.exports = model("categories", categorySchema);
