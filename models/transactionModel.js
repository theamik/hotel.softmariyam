const { Schema, model, mongoose } = require("mongoose");

const schema = new Schema(
  {
    transactionNo: {
      type: String,
    },
    orderNo: {
      type: Number,
    },
    description: {
      type: String,
      default: "Its a sales transaction!",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches",
    },
    debit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parties",
    },
    credit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parties",
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactionType: {
      type: String,
      default: "Sales",
    },
    generatedBy: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

schema.index(
  {
    transactionType: "text",
    description: "text",
  },
  {
    weights: {
      transactionType: 5,
      description: 4,
    },
  }
);

module.exports = model("transactions", schema);
