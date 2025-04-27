// const authOrderModel = require('../../models/authOrder')
// const customerOrder = require('../../models/customerOrder')
// const cardModel = require('../../models/cardModel')
// const myShopWallet = require('../../models/myShopWallet')
// const sellerWallet = require('../../models/sellerWallet')
const {
  mongo: { ObjectId },
} = require("mongoose");
const { responseReturn } = require("../../utils/response");

const moment = require("moment");
const ownerModel = require("../../models/ownerModel");
const staffModel = require("../../models/staffModel");
const draftModel = require("../../models/draftModel");
const partyModel = require("../../models/partyModel");
const orderModel = require("../../models/orderModel");
const serviceModel = require("../../models/serviceModel");
const transactionModel = require("../../models/transactionModel");
const purchaseModel = require("../../models/purchaseModel");
const tableModel = require("../../models/tableModel");
const programModel = require("../../models/programModel");
class orderController {
  purchase_confirm = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const { name } = await ownerModel.findById(id);
    const {
      cartItems,
      totalAmount,
      totalQuantity,
      party,
      value,
      description,
      branch,
    } = req.body;
    // console.log(branch);
    if (value?.startDate) {
      var tempDate = moment(value.startDate).format();
    } else {
      var tempDate = moment(Date.now()).format();
    }
    const credit_party = await partyModel.findById(party);
    const debit_party = await partyModel.find({
      accountType: "Purchase_Account",
      companyId: companyId,
    });
    const UniqueId = Date.now().toString(36).toUpperCase();

    try {
      const transaction = await transactionModel.create({
        transactionNo: UniqueId,
        companyId: new ObjectId(companyId),
        branchId: branch.toString(),
        debit: debit_party[0],
        credit: credit_party,
        generatedBy: name,
        transactionType: "Purchase",
        description: description ? description : "Its purchase transaction",
        balance: totalAmount,
        date: tempDate,
      });
      const purchase = await purchaseModel.create({
        purchaseNo: UniqueId,
        transactionId: transaction.id,
        companyId: new ObjectId(companyId),
        branchId: branch.toString(),
        purchaseForm: credit_party,
        generatedBy: name,
        cartItems,
        totalAmount,
        totalQuantity,
        date: tempDate,
      });

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const product = await productModel.findById(item.id);
        for (let j = 0; j < item.sn.length; j++) {
          const serial = item.sn[j];
          product.serial.push(serial);
        }
        product.purchase_price =
          (product.purchase_price * product.stock + item.price) /
          (product.stock + item.quantity);
        product.stock += item.quantity;

        await product.save({ validateBeforeSave: false });
      }
      responseReturn(res, 201, {
        purchase,
        message: "Purchased Confirmed",
      });

      debit_party[0].balance =
        Number(debit_party[0].balance) + Number(totalAmount);
      await debit_party[0].save();
      credit_party.balance = Number(credit_party.balance) - Number(totalAmount);
      await credit_party.save();
    } catch (error) {
      console.log(error.message);
    }
  };

  get_purchases = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    try {
      const purchases = await purchaseModel
        .find({
          companyId: companyId,
        })
        .sort({ date: -1 })
        .populate("purchaseForm");
      const totalPurchases = await purchaseModel
        .find({
          companyId: companyId,
        })
        .countDocuments();
      responseReturn(res, 200, {
        purchases,
        totalPurchases,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_purchase = async (req, res) => {
    const { purchaseId } = req.params;

    console.log(purchaseId);

    try {
      const purchase = await purchaseModel
        .findById(purchaseId)
        .populate("purchaseForm");
      responseReturn(res, 200, {
        purchase,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_parties = async (req, res) => {
    const { id } = req;
    try {
      const parties = await tableModel
        .find({ position: "available" })
        .sort({ date: -1 });
      const totalParties = await tableModel
        .find({ position: "available" })
        .countDocuments();
      responseReturn(res, 200, {
        parties,
        totalParties,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  place_order = async (req, res) => {
    const { id, role } = req;
    const {
      cartItems,
      totalAmount,
      totalQuantity,
      discount,
      finalAmount,
      partyId,
      delivery,
      service,
      party,
    } = req.body;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var { name } = await ownerModel.findById(id);
    }
    var tempDate = moment(Date.now()).format();

    const credit_party = await partyModel.find({
      accountType: "res_sales_account",
    });
    const discount_party = await partyModel.find({
      accountType: "discount",
      under: "restaurant",
    });
    const debit_party = await partyModel.find({
      accountType: "cash_restaurant",
    });

    const UniqueId = Date.now().toString(36).toUpperCase();
    const order_no = await orderModel.find().sort({ $natural: -1 }).limit(1);
    if (order_no[0]?.orderNo === undefined) {
      var newOrderId = Number(200001);
    } else {
      var newOrderId = Number(order_no[0]?.orderNo) + 1;
    }
    try {
      if (discount > 0) {
        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: finalAmount,
          date: tempDate,
          orderNo: newOrderId,
        });
        const transaction2 = await transactionModel.create({
          transactionNo: UniqueId,
          debit: discount_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: discount,
          date: tempDate,
          orderNo: newOrderId,
        });
        const order = await orderModel.create({
          orderNo: newOrderId,
          transactionId: transaction.id,
          party: party,
          generatedBy: name,
          cartItems,
          totalAmount,
          totalQuantity,
          discount,
          delivery,
          service,
          finalAmount,
          date: tempDate,
        });

        responseReturn(res, 201, {
          order,
          message: "Order placed successfully",
        });
      } else {
        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0]._id,
          generatedBy: name,
          balance: totalAmount,
          date: tempDate,
        });
        const order = await orderModel.create({
          orderNo: newOrderId,
          transactionId: transaction.id,
          party: party,
          generatedBy: name,
          cartItems,
          totalAmount,
          totalQuantity,
          discount,
          delivery,
          service,
          finalAmount,
          date: tempDate,
        });
        responseReturn(res, 201, {
          order,
          message: "Order placed successfully",
        });
      }
      debit_party[0].balance =
        Number(debit_party[0].balance) + Number(finalAmount);
      await debit_party[0].save();
      discount_party[0].balance =
        Number(discount_party[0].balance) + Number(discount);
      await discount_party[0].save();
      credit_party[0].balance =
        Number(credit_party[0].balance) - Number(finalAmount + discount);
      await credit_party[0].save();
    } catch (error) {
      console.log(error.message);
    }
  };

  get_company_orders = async (req, res) => {
    const { id } = req;
    try {
      const orders = await orderModel.find().sort({ createdAt: -1 });
      const totalOrders = await orderModel.find().countDocuments();

      responseReturn(res, 200, {
        orders,
        totalOrders,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_company_order = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await orderModel.findById(orderId);
      responseReturn(res, 200, {
        order,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  cancel_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await orderModel.findById(orderId);

      const credit_party = await partyModel.find({
        accountType: "res_sales_account",
      });

      const discount_party = await partyModel.find({
        accountType: "discount",
        under: "restaurant",
      });

      const debit_party = await partyModel.find({
        accountType: "cash_restaurant",
      });
      debit_party[0].balance =
        Number(debit_party[0].balance) - Number(order.finalAmount);
      await debit_party[0].save();
      discount_party[0].balance =
        Number(discount_party[0].balance) - Number(order.discount);
      await discount_party[0].save();
      credit_party[0].balance =
        Number(credit_party[0].balance) +
        Number(order.finalAmount + order.discount);
      await credit_party[0].save();

      await order.deleteOne();
      responseReturn(res, 200, {
        message: "Order Cancelled!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_order = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await orderModel.findById(orderId).populate("party");
      responseReturn(res, 200, {
        order,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_branch_orders = async (req, res) => {
    const { id } = req;
    const { branchId } = await staffModel.findById(id);
    try {
      const orders = await orderModel
        .find({
          branchId: branchId,
        })
        .sort({ createdAt: -1 });
      const totalOrders = await orderModel
        .find({
          branchId: branchId,
        })
        .countDocuments();

      responseReturn(res, 200, {
        orders,
        totalOrders,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  make_draft = async (req, res) => {
    const { id, role } = req;
    const {
      cartItems,
      totalAmount,
      totalQuantity,
      discount,
      finalAmount,
      party,
      partyId,
      value,
      delivery,
      service,
    } = req.body;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var { name } = await ownerModel.findById(id);
    }

    if (value?.startDate) {
      var tempDate = moment(value.startDate).format();
    } else {
      var tempDate = moment(Date.now()).format();
    }
    try {
      const draft = await draftModel.create({
        generatedBy: name,
        party: party,
        cartItems,
        totalAmount,
        totalQuantity,
        discount,
        finalAmount,
        delivery,
        service,
        date: tempDate,
        partyId,
      });

      const table = await tableModel.findById(partyId);

      table.position = "booked";

      await table.save();
      responseReturn(res, 201, {
        draft,
        message: "Pre-order generated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_company_drafts = async (req, res) => {
    const { id } = req;
    try {
      const drafts = await draftModel.find({}).sort({ date: -1 });
      const totalDrafts = await draftModel.find({}).countDocuments();

      responseReturn(res, 200, {
        drafts,
        totalDrafts,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_branch_drafts = async (req, res) => {
    const { id } = req;
    const { branchId } = await staffModel.findById(id);
    try {
      const drafts = await draftModel
        .find({
          branchId: branchId,
        })
        .sort({ createdAt: -1 });
      const totalDrafts = await draftModel
        .find({
          branchId: branchId,
        })
        .countDocuments();

      responseReturn(res, 200, {
        drafts,
        totalDrafts,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_draft = async (req, res) => {
    const { preOrderId } = req.params;
    try {
      const draft = await draftModel.findById({ _id: preOrderId });
      responseReturn(res, 200, {
        draft,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  remove_draft = async (req, res) => {
    const { preOrderId, partyId } = req.params;
    console.log(partyId);
    try {
      await draftModel.findByIdAndDelete(preOrderId);

      const table = await tableModel.findById(partyId);

      table.position = "available";

      await table.save();
      responseReturn(res, 200, {
        message: "Draft Cleared!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_orders = async (req, res) => {
    const { customerId, status } = req.params;

    try {
      let orders = [];
      if (status !== "all") {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
          delivery_status: status,
        });
      } else {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
        });
      }
      responseReturn(res, 200, {
        orders,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_admin_orders = async (req, res) => {
    let { page, parPage, searchValue } = req.query;
    page = parseInt(page);
    parPage = parseInt(parPage);
    const skipPage = parPage * (page - 1);

    try {
      if (searchValue) {
      } else {
        const orders = await customerOrder
          .aggregate([
            {
              $lookup: {
                from: "authororders",
                localField: "_id",
                foreignField: "orderId",
                as: "suborder",
              },
            },
          ])
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });

        const totalOrder = await customerOrder.aggregate([
          {
            $lookup: {
              from: "authororders",
              localField: "_id",
              foreignField: "orderId",
              as: "suborder",
            },
          },
        ]);

        responseReturn(res, 200, { orders, totalOrder: totalOrder.length });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_admin_order = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await customerOrder.aggregate([
        {
          $match: { _id: new ObjectId(orderId) },
        },
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "suborder",
          },
        },
      ]);
      responseReturn(res, 200, { order: order[0] });
    } catch (error) {
      console.log("get admin order " + error.message);
    }
  };

  admin_order_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, { message: "Order status updated" });
    } catch (error) {
      console.log("get admin order status error " + error.message);
      responseReturn(res, 500, { message: "internal server error" });
    }
  };

  get_seller_orders = async (req, res) => {
    const { sellerId } = req.params;
    let { page, parPage, searchValue } = req.query;
    page = parseInt(page);
    parPage = parseInt(parPage);

    const skipPage = parPage * (page - 1);

    try {
      if (searchValue) {
      } else {
        const orders = await authOrderModel
          .find({
            sellerId,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalOrder = await authOrderModel
          .find({
            sellerId,
          })
          .countDocuments();
        responseReturn(res, 200, { orders, totalOrder });
      }
    } catch (error) {
      console.log("get seller order error " + error.message);
      responseReturn(res, 500, { message: "internal server error" });
    }
  };

  get_seller_order = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await authOrderModel.findById(orderId);

      responseReturn(res, 200, { order });
    } catch (error) {
      console.log("get admin order " + error.message);
    }
  };

  seller_order_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
      await authOrderModel.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, { message: "Order status updated" });
    } catch (error) {
      console.log("get admin order status error " + error.message);
      responseReturn(res, 500, { message: "internal server error" });
    }
  };

  order_confirm = async (req, res) => {
    const { orderId } = req.params;
    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        payment_status: "paid",
        delivery_status: "pending",
      });
      await authOrderModel.updateMany(
        { orderId: new ObjectId(orderId) },
        {
          payment_status: "paid",
          delivery_status: "pending",
        }
      );
      const cuOrder = await customerOrder.findById(orderId);

      const auOrder = await authOrderModel.find({
        orderId: new ObjectId(orderId),
      });

      const time = moment(Date.now()).format("l");

      const splitTime = time.split("/");

      await myShopWallet.create({
        amount: cuOrder.price,
        month: splitTime[0],
        year: splitTime[2],
      });

      for (let i = 0; i < auOrder.length; i++) {
        await sellerWallet.create({
          sellerId: auOrder[i].sellerId.toString(),
          amount: auOrder[i].price,
          manth: splitTime[0],
          year: splitTime[2],
        });
      }

      responseReturn(res, 200, { message: "success" });
    } catch (error) {
      console.log(error.message);
    }
  };

  make_service = async (req, res) => {
    const { id, role } = req;
    const { serviceProduct, description, party, branch } = req.body;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var branchId = branch.toString();
      var { name } = await ownerModel.findById(id);
    }
    const tempDate = moment(Date.now()).format();
    const service_no = await serviceModel
      .find()
      .sort({ $natural: -1 })
      .limit(1);
    if (service_no[0]?.serviceNo === undefined) {
      var newServiceId = Number(200001);
    } else {
      var newServiceId = Number(service_no[0]?.serviceNo) + 1;
    }
    try {
      const data = await serviceModel.create({
        serviceNo: newServiceId,
        companyId: new ObjectId(companyId),
        branchId: branchId,
        generatedBy: name,
        party: party,
        product: serviceProduct,
        problem: description,
        date: tempDate,
      });
      const service = await serviceModel.findById(data._id).populate("party");
      responseReturn(res, 201, {
        message: "Service received successfully",
        service,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_company_services = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    try {
      const services = await serviceModel
        .find({
          companyId: companyId,
        })
        .sort({ createdAt: -1 })
        .populate("party");
      const totalServices = await serviceModel
        .find({
          companyId: companyId,
        })
        .countDocuments();

      responseReturn(res, 200, {
        services,
        totalServices,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  get_company_service = async (req, res) => {
    const { serviceId } = req.params;

    try {
      const service = await serviceModel.findById(serviceId).populate("party");
      responseReturn(res, 200, {
        service,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_branch_services = async (req, res) => {
    const { id } = req;
    const { branchId } = await staffModel.findById(id);
    try {
      const services = await serviceModel
        .find({
          branchId: branchId,
        })
        .sort({ createdAt: -1 })
        .populate("party");
      const totalServices = await serviceModel
        .find({
          branchId: branchId,
        })
        .countDocuments();

      responseReturn(res, 200, {
        services,
        totalServices,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_status = async (req, res) => {
    const { serviceId, status, station } = req.body;
    const updateDate = moment(Date.now()).format();
    try {
      await serviceModel.findByIdAndUpdate(serviceId, {
        status,
        station,
        updateDate,
      });
      const service = await serviceModel.findById(serviceId).populate("party");
      responseReturn(res, 200, {
        service,
        message: "Updated service info successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  new_program = async (req, res) => {
    const { id, role } = req;
    const {
      foodItems,
      totalAmount,
      discount,
      finalAmount,
      hallCharge,
      decoration,
      service,
      guestId,
      totalGuest,
      due,
      paid,
      programDate,
      hall,
      programType,
      perHead,
      reference,
      season,
    } = req.body;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var { name } = await ownerModel.findById(id);
    }
    var tempDate = moment(Date.now()).format();
    var date = moment(programDate).format();
    const credit_party = await partyModel.find({
      accountType: "income",
      under: "restaurant",
    });
    const discount_party = await partyModel.find({
      accountType: "discount",
      under: "restaurant",
    });
    const debit_party = await partyModel.find({
      accountType: "cash_restaurant",
    });
    const lastPaid = paid[paid.length - 1].paid;
    const UniqueId = Date.now().toString(36).toUpperCase();
    const program_no = await programModel
      .find()
      .sort({ $natural: -1 })
      .limit(1);
    if (program_no[0]?.programNo === undefined) {
      var newProgramId = Number(30001);
    } else {
      var newProgramId = Number(program_no[0]?.programNo) + 1;
    }
    try {
      if (discount > 0) {
        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: lastPaid,
          date: tempDate,
          orderNo: newProgramId,
        });
        const transaction2 = await transactionModel.create({
          transactionNo: UniqueId,
          debit: discount_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: discount,
          date: tempDate,
          orderNo: newProgramId,
        });
        const program = await programModel.create({
          programNo: newProgramId,
          transactionId: transaction.id,
          guestId: guestId,
          generatedBy: name,
          foodItems,
          totalAmount,
          totalGuest,
          discount,
          service,
          hallCharge,
          decoration,
          finalAmount,
          bookedDate: tempDate,
          due,
          paid,
          programDate: date,
          hall,
          programType,
          perHead,
          reference,
          season,
        });

        responseReturn(res, 201, {
          program,
          message: "Program placed successfully",
        });
      } else {
        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0]._id,
          generatedBy: name,
          balance: lastPaid,
          date: tempDate,
          orderNo: newProgramId,
        });
        const program = await programModel.create({
          programNo: newProgramId,
          transactionId: transaction.id,
          guestId: guestId,
          generatedBy: name,
          foodItems,
          totalAmount,
          totalGuest,
          discount,
          hallCharge,
          decoration,
          service,
          finalAmount,
          due,
          paid,
          programDate: date,
          bookedDate: tempDate,
          hall,
          programType,
          perHead,
          reference,
          season,
        });
        responseReturn(res, 201, {
          program,
          message: "Program placed successfully",
        });
      }
      debit_party[0].balance =
        Number(debit_party[0].balance) + Number(lastPaid);
      await debit_party[0].save();
      discount_party[0].balance =
        Number(discount_party[0].balance) + Number(discount);
      await discount_party[0].save();
      credit_party[0].balance =
        Number(credit_party[0].balance) - Number(lastPaid + discount);
      await credit_party[0].save();
    } catch (error) {
      responseReturn(res, 500, {
        error,
      });
      console.log(error.message);
    }
  };

  all_programs = async (req, res) => {
    const { id } = req;
    try {
      const programs = await programModel.find().sort({ createdAt: -1 });
      const totalPrograms = await programModel.find().countDocuments();

      responseReturn(res, 200, {
        programs,
        totalPrograms,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_a_program = async (req, res) => {
    const { programId } = req.params;
    try {
      const program = await programModel
        .findById(programId)
        .populate("guestId");
      responseReturn(res, 200, {
        program,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  update_program = async (req, res) => {
    const { id, role } = req;
    const {
      foodItems,
      totalAmount,
      discount,
      finalAmount,
      hallCharge,
      decoration,
      service,
      guestId,
      totalGuest,
      due,
      paid,
      programDate,
      hall,
      programType,
      perHead,
      reference,
      season,
      programId,
    } = req.body;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var { name } = await ownerModel.findById(id);
    }
    var tempDate = moment(Date.now()).format();
    var date = moment(programDate).format();
    const credit_party = await partyModel.find({
      accountType: "income",
      under: "restaurant",
    });
    const discount_party = await partyModel.find({
      accountType: "discount",
      under: "restaurant",
    });
    const debit_party = await partyModel.find({
      accountType: "cash_restaurant",
    });
    const UniqueId = Date.now().toString(36).toUpperCase();
    const program_no = await programModel
      .find()
      .sort({ $natural: -1 })
      .limit(1);

    try {
      if (discount > 0) {
        const program = await programModel.findByIdAndUpdate(programId, {
          guestId: guestId,
          generatedBy: name,
          totalAmount,
          totalGuest,
          discount,
          service,
          hallCharge,
          decoration,
          finalAmount,
          bookedDate: tempDate,
          programDate: date,
          hall,
          programType,
          perHead,
          reference,
          season,
        });

        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: paid[0].paid,
          date: tempDate,
          orderNo: program?.programNo,
        });
        const transaction2 = await transactionModel.create({
          transactionNo: UniqueId,
          debit: discount_party[0],
          credit: credit_party[0],
          generatedBy: name,
          balance: discount,
          date: tempDate,
          orderNo: program?.programNo,
        });

        program?.foodItems.push(...foodItems);
        program?.paid.push(...paid);
        program?.due - paid[0]?.paid;
        await program.save();

        responseReturn(res, 201, {
          guest,
          message: "Program updated successfully",
        });
      } else {
        const program = await programModel.findByIdAndUpdate(programId, {
          guestId: guestId,
          generatedBy: name,
          totalAmount,
          totalGuest,
          discount,
          hallCharge,
          decoration,
          service,
          finalAmount,
          programDate: date,
          hall,
          programType,
          perHead,
          reference,
          season,
        });
        const transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party[0],
          credit: credit_party[0]._id,
          generatedBy: name,
          balance: paid[0].paid,
          date: tempDate,
          orderNo: program?.programNo,
        });

        program?.foodItems.push(...foodItems);
        program?.paid.push(...paid);
        program?.due - paid[0]?.paid;
        await program.save();

        const guest = programModel.findById(programId);
        responseReturn(res, 201, {
          guest,
          message: "Program updated successfully",
        });
      }

      debit_party[0].balance =
        Number(debit_party[0].balance) + Number(paid[0]?.paid);
      await debit_party[0].save();
      discount_party[0].balance =
        Number(discount_party[0].balance) + Number(discount);
      await discount_party[0].save();
      credit_party[0].balance =
        Number(credit_party[0].balance) - Number(paid[0]?.paid + discount);
      await credit_party[0].save();
    } catch (error) {
      responseReturn(res, 500, {
        error,
      });
      console.log(error.message);
    }
  };

  cancel_program = async (req, res) => {
    const { programId } = req.params;
    try {
      const program = await programModel.findById(programId);

      const lastPaid = program?.paid?.reduce((n, { paid }) => n + paid, 0);

      const credit_party = await partyModel.find({
        accountType: "income",
        under: "restaurant",
      });
      const discount_party = await partyModel.find({
        accountType: "discount",
        under: "restaurant",
      });
      const debit_party = await partyModel.find({
        accountType: "cash_restaurant",
      });

      debit_party[0].balance =
        Number(debit_party[0].balance) - Number(lastPaid);
      await debit_party[0].save();
      discount_party[0].balance =
        Number(discount_party[0].balance) - Number(program.discount);
      await discount_party[0].save();
      credit_party[0].balance =
        Number(credit_party[0].balance) + Number(lastPaid + program.discount);
      await credit_party[0].save();

      await program.deleteOne();
      responseReturn(res, 200, {
        message: "Program Cancelled!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new orderController();
