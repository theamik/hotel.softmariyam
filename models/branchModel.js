const { Schema, model, mongoose } = require("mongoose");
const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter branch name!"],
    },
    email: {
      type: String,
    },
    slug: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please enter branch address!"],
    },
    mobile: {
      type: String,
      required: [true, "Please enter branch mobile number!"],
      minLength: [11, "Mobile number must be at least 11 characters"],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
    division: {
      type: String,
    },
    district: {
      type: String,
    },
    sub_district: {
      type: String,
    },
    police_station: {
      type: String,
    },
    post_code: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

branchSchema.index(
  {
    name: "text",
    mobile: "text",
  },
  {
    weights: {
      name: 5,
      email: 4,
    },
  }
);

module.exports = model("branches", branchSchema);
