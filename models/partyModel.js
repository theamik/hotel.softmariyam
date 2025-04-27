const { Schema, model, mongoose } = require("mongoose");

const partySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter party name!"],
      minLength: [4, "Name must be at least 4 characters"],
      mixLength: [80, "Name must be at most 80 characters"],
    },
    address: {
      type: String,
      required: [true, "Please enter party address!"],
    },
    mobile: {
      type: String,
      required: [true, "Please enter party mobile number!"],
    },
    description: {
      type: String,
      required: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    accountType: {
      type: String,
      required: true,
    },
    under: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
  },
  { timestamps: true }
);

partySchema.index(
  {
    name: "text",
    mobile: "text",
  },
  {
    weights: {
      name: 5,
      mobile: 4,
    },
  }
);

module.exports = model("parties", partySchema);
