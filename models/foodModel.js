const { Schema, model, mongoose } = require("mongoose");

const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menus",
    },
    price: {
      type: String,
      required: false,
    },
    duration: {
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
  },
  { timestamps: true }
);

foodSchema.index(
  {
    name: "text",
  },
  {
    weights: {
      name: 5,
    },
  }
);

module.exports = model("foods", foodSchema);
