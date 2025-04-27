const {
  mongo: { ObjectId },
} = require("mongoose");
const { responseReturn } = require("../../utils/response");
const staffModel = require("../../models/staffModel");
const ownerModel = require("../../models/ownerModel");
const partyModel = require("../../models/partyModel");
const transactionModel = require("../../models/transactionModel");
const moment = require("moment");
const productModel = require("../../models/productModel");
const orderModel = require("../../models/orderModel");

module.exports.get_seller_dashboard_data = async (req, res) => {
  const { id, role } = req;

  if (role === "staff") {
    var { companyId } = await staffModel.findById(id);
  } else {
    var { companyId } = await ownerModel.findById(id);
  }
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const startDate = moment(firstDay).format();
  const endDate = moment(lastDay).format();

  try {
    //Sales Transaction
    const sales_party = await partyModel.find({
      accountType: "Sales_Account",
    });
    const salesTransactions = await transactionModel
      .find({ companyId: companyId, credit: sales_party })
      .where({ date: { $gte: startDate, $lte: endDate } });

    let totalSales = 0;

    for (let i = 0; i < salesTransactions?.length; i++) {
      totalSales += salesTransactions[i]?.balance;
    }

    console.log(totalSales);

    //Total Products

    const totalProducts = await productModel.find({}).countDocuments();
    const totalOrders = await orderModel
      .find({ companyId: companyId })
      .where({ date: { $gte: startDate, $lte: endDate } })
      .countDocuments();
    const totalParty = await partyModel
      .find({
        accountType: "Account_Receivable",
      })
      .countDocuments();
    responseReturn(res, 200, {
      totalSales,
      totalProducts,
      totalOrders,
      totalParty,
    });
  } catch (error) {
    console.log("get seller dashboard data error " + error.messages);
  }
};
