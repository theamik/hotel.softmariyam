const { Schema, model, mongoose } = require("mongoose");

const tableSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    occupancy: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      default: "available",
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "pending",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
  },
  { timestamps: true }
);

tableSchema.index(
  {
    name: "text",
  },
  {
    weights: {
      name: 5,
    },
  }
);

module.exports = model("tables", tableSchema);
