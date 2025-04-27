const { Schema, model, mongoose } = require("mongoose");

const menuSchema = new Schema(
  {
    name: {
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
    foodId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "owners",
      },
    ],
  },
  { timestamps: true }
);

menuSchema.index({
  name: "text",
});

module.exports = model("menus", menuSchema);
