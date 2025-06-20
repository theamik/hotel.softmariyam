// const authOrderModel = require('../../models/authOrder')
// const customerOrder = require('../../models/customerOrder')
// const cardModel = require('../../models/cardModel')
// const myShopWallet = require('../../models/myShopWallet')
// const sellerWallet = require('../../models/sellerWallet')
const {
  mongo: { ObjectId },
} = require("mongoose");
const mongoose = require("mongoose");
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
const reservationModel = require("../../models/reservationModel");
const roomModel = require("../../models/roomModel");
const guestModel = require("../../models/guestModel");
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
      var tempDate = moment(value.startDate).format("YYYY-MM-DD");
    } else {
      var tempDate = moment(Date.now()).format("YYYY-MM-DD");
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
    const { companyId } = await ownerModel.findById(id);
    try {
      const parties = await tableModel
        .find({ position: "available", companyId: companyId })
        .sort({ date: -1 });
      const totalParties = await tableModel
        .find({ position: "available", companyId: companyId })
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
      remark, // Remark is correctly received here from the frontend
    } = req.body;

    let generatedByUserName;
    let companyId;
    let branchId = null; // Initialize as null for cases where staff is not applicable

    try {
      // 1. Optimize User Data Fetching: Fetch staff/owner data once
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return responseReturn(res, 404, { error: "Staff user not found." });
        }
        branchId = staff.branchId;
        companyId = staff.companyId;
        generatedByUserName = staff.name;
      } else {
        // Assuming 'owner' role
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return responseReturn(res, 404, { error: "Owner user not found." });
        }
        companyId = owner.companyId;
        generatedByUserName = owner.name;
      }

      // 2. Capture Full Date and Time for consistency
      const currentDateTime = new Date(); // Captures full timestamp (date and time)

      // 3. Fetch Parties Needed for Transactions using findOne
      const credit_party = await partyModel.findOne({
        accountType: "res_sales_account",
        under: "restaurant",
        companyId: companyId,
      });
      const discount_party = await partyModel.findOne({
        accountType: "discount",
        under: "restaurant",
        companyId: companyId,
      });
      const debit_party = await partyModel.findOne({
        accountType: "accounts_receivable",
        under: "restaurant",
        companyId: companyId,
      });

      // Basic validation for critical parties
      if (!credit_party || !debit_party) {
        return responseReturn(res, 500, {
          error:
            "Required transaction parties (Sales, Accounts Receivable) not configured.",
        });
      }
      if (discount > 0 && !discount_party) {
        return responseReturn(res, 500, {
          error: "Discount party not configured for transactions.",
        });
      }

      // 4. Generate Unique ID and Order Number
      const UniqueId = Date.now().toString(36).toUpperCase();
      const latestOrder = await orderModel.findOne().sort({ orderNo: -1 }); // Sort by orderNo descending
      const newOrderId = latestOrder ? Number(latestOrder.orderNo) + 1 : 200001;

      let transaction;
      let discountTransaction = null;

      // Create transactions based on whether a discount is applied
      if (discount > 0) {
        transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party._id,
          credit: credit_party._id,
          generatedBy: generatedByUserName,
          balance: finalAmount,
          date: currentDateTime, // Use full date and time
          orderNo: newOrderId,
          companyId: companyId,
          ...(branchId && { branchId }), // Conditionally add branchId
        });

        discountTransaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: discount_party._id,
          credit: credit_party._id,
          generatedBy: generatedByUserName,
          balance: discount,
          date: currentDateTime, // Use full date and time
          orderNo: newOrderId,
          companyId: companyId,
          ...(branchId && { branchId }), // Conditionally add branchId
        });
      } else {
        transaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: debit_party._id,
          credit: credit_party._id,
          generatedBy: generatedByUserName,
          balance: finalAmount,
          date: currentDateTime, // Use full date and time
          companyId: companyId,
          orderNo: newOrderId,
          ...(branchId && { branchId }), // Conditionally add branchId
        });
      }

      // 5. Create the Order Entry
      const order = await orderModel.create({
        orderNo: newOrderId,
        transactionId: transaction._id,
        party: party,
        generatedBy: generatedByUserName,
        cartItems,
        totalAmount,
        totalQuantity,
        discount,
        delivery,
        service,
        partyId,
        finalAmount,
        date: currentDateTime, // Use full date and time
        companyId: companyId,
        remark, // Remark is correctly passed to orderModel
        ...(branchId && { branchId }), // Conditionally add branchId
      });

      debit_party.balance =
        (Number(debit_party.balance) || 0) + Number(finalAmount);
      await debit_party.save();

      if (discount > 0 && discount_party) {
        discount_party.balance =
          (Number(discount_party.balance) || 0) + Number(discount);
        await discount_party.save();
      }

      // Assuming credit_party (res_sales_account) is an income account whose balance increases with credits.
      // It receives credit entries for both finalAmount and discount from the transactions.
      credit_party.balance =
        (Number(credit_party.balance) || 0) +
        Number(finalAmount) +
        Number(discount);
      await credit_party.save();

      // Send successful response
      responseReturn(res, 201, {
        order,
        message: "Order placed successfully",
      });
    } catch (error) {
      console.error("Error placing order:", error); // Log the full error for debugging
      responseReturn(res, 500, {
        error: "Failed to place order due to an internal server error.",
      });
    }
  };

  get_company_orders = async (req, res) => {
    const { id, role } = req; // Assuming 'id' is userId/staffId/ownerId and 'role' from auth middleware
    const { page, perPage, searchQuery, status } = req.query; // Extract query parameters

    let companyId = null;
    let branchId = null;
    const queryObject = {}; // Initialize the query object for MongoDB

    try {
      // --- 1. Determine User Role and Fetch Company/Branch ID ---
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        branchId = staff.branchId; // Staff can only see orders for their branch
        queryObject.branchId = branchId; // Add branch filter for staff
      } else {
        // Role is owner
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
      }

      if (!companyId) {
        return responseReturn(res, 400, {
          message: "Company ID not found for the user.",
        });
      }

      queryObject.companyId = companyId; // Always filter by companyId

      // --- 2. Apply Status Filter ---
      const allowedStatuses = ["paid", "due", "cancelled"];
      if (status && allowedStatuses.includes(status)) {
        queryObject.status = status;
      }

      // --- 3. Apply Search Query ---
      if (searchQuery) {
        const regex = new RegExp(searchQuery, "i"); // Case-insensitive search
        // Search across orderNo and party fields.
        // For more complex search (e.g., within cartItems), you might need $lookup and $unwind.
        queryObject.$or = [
          { orderNo: regex },
          { party: regex },
          // Add other fields you want to search by here
        ];
      }

      // --- 4. Pagination Setup ---
      const currentPageNum = parseInt(page) || 1;
      const itemsPerPageNum = parseInt(perPage) || 10;
      const skip = (currentPageNum - 1) * itemsPerPageNum;

      // --- 5. Fetch Total Orders (with filters applied for accurate count) ---
      const totalOrders = await orderModel.countDocuments(queryObject);

      // --- 6. Fetch Paginated and Filtered Orders ---
      const orders = await orderModel
        .find(queryObject)
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip(skip)
        .limit(itemsPerPageNum);

      responseReturn(res, 200, {
        orders,
        totalOrders,
        message: "Orders fetched successfully.",
      });
    } catch (error) {
      console.error("Error in get_company_orders:", error);
      responseReturn(res, 500, {
        message: "Internal server error: Unable to retrieve orders.",
        details: error.message,
      });
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

  update_order_status = async (req, res) => {
    const { id, role } = req; // Assuming 'id' is userId/staffId/ownerId from auth middleware
    const { orderId } = req.params; // Get order ID from URL parameters
    const { status: newStatus } = req.body; // Get new status from request body

    let companyId,
      generatedByName,
      branchId = null; // Initialize branchId

    let session = null; // For MongoDB transaction

    try {
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        generatedByName = staff.name;
        branchId = staff.branchId;
      } else {
        // Role is owner
        const owner = await ownerModel.findById(id);
        if (!owner) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
        generatedByName = owner.name;
      }

      if (!companyId) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, { message: "Company ID not found." });
      }

      // --- 2. Validate Inputs ---
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Invalid Order ID format.",
        });
      }

      const allowedStatuses = ["paid", "due", "cancelled"];
      if (!allowedStatuses.includes(newStatus)) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: `Invalid status provided. Must be one of: ${allowedStatuses.join(
            ", "
          )}`,
        });
      }

      // --- 3. Fetch Existing Order ---
      const existingOrder = await orderModel.findById(orderId); // { session } if using transactions
      if (!existingOrder) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 404, { message: "Order not found." });
      }

      const currentStatus = existingOrder.status;

      // --- 4. Implement Status Transition Validation Rules ---
      if (
        currentStatus === "paid" &&
        (newStatus === "due" || newStatus === "cancelled")
      ) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Cannot change a 'Paid' order back to 'Due' or 'Cancelled'.",
        });
      }
      if (
        currentStatus === "cancelled" &&
        (newStatus === "paid" || newStatus === "due")
      ) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Cannot change a 'Cancelled' order back to 'Paid' or 'Due'.",
        });
      }

      // If the status is already the new status, no action needed
      if (currentStatus === newStatus) {
        return responseReturn(res, 200, {
          order: existingOrder,
          message: "Order status is already up to date.",
        });
      }

      // --- 5. Fetch Financial Parties (only if a financial transaction might be involved) ---
      let cashRestaurantParty = null;
      let accRecParty = null;
      let saleParty = null; // Even if not directly used, good to have for consistency if needed

      // Only fetch if we're transitioning to 'paid' (which creates a transaction)
      if (
        newStatus === "paid" ||
        (newStatus === "cancelled" && currentStatus === "due")
      ) {
        [accRecParty, cashRestaurantParty, saleParty] = await Promise.all([
          partyModel.findOne({
            accountType: "accounts_receivable",
            under: "restaurant",
            companyId: companyId,
          }),
          partyModel.findOne({
            accountType: "cash_restaurant",
            under: "restaurant",
            companyId: companyId,
          }),
          partyModel.findOne({
            accountType: "res_sales_account",
            under: "restaurant",
            companyId: companyId,
          }), // Ensure trailing space if that's in DB
        ]);

        if (!accRecParty || !cashRestaurantParty || !saleParty) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 500, {
            message:
              "Required financial accounts for payment ('income' or 'cash_restaurant') not found. Please set them up.",
          });
        }
      }

      const tempDate = moment().format("YYYY-MM-DD");
      const UniqueId = Date.now().toString(36).toUpperCase();
      let transactionId = null; // To store new transaction ID if created

      // --- 6. Handle Financial Implications based on Status Change ---
      const updateFields = { status: newStatus };

      if (newStatus === "paid" && currentStatus === "due") {
        // Logic for paying off a 'due' order
        const amountToPay = existingOrder.totalAmount; // The outstanding due amount
        if (amountToPay > 0) {
          // Create a new transaction for this payment
          const newTransaction = await transactionModel.create([
            {
              transactionNo: UniqueId + "-PAY",
              debit: cashRestaurantParty._id, // Cash account is debited
              credit: accRecParty._id, // Income account is credited
              generatedBy: generatedByName,
              balance: amountToPay,
              date: tempDate,
              orderNo: existingOrder.orderNo, // Link to the order
              companyId: companyId,
              branchId: branchId,
            },
          ]); // { session }
          transactionId = newTransaction[0]._id;

          // Update Party Balances
          cashRestaurantParty.balance =
            Number(cashRestaurantParty.balance) + amountToPay;
          await cashRestaurantParty.save(); // { session }

          accRecParty.balance = Number(accRecParty.balance) + amountToPay; // Income increases
          await accRecParty.save(); // { session }
        }
      } else if (newStatus === "cancelled") {
        const amountToPay = existingOrder.totalAmount; // The outstanding due amount
        if (amountToPay > 0) {
          // Create a new transaction for this payment
          const newTransaction = await transactionModel.create([
            {
              transactionNo: UniqueId + "-PAY",
              debit: saleParty._id, // Cash account is debited
              credit: accRecParty._id, // Income account is credited
              generatedBy: generatedByName,
              balance: amountToPay,
              date: tempDate,
              orderNo: existingOrder.orderNo, // Link to the order
              companyId: companyId,
              branchId: branchId,
            },
          ]); // { session }
          transactionId = newTransaction[0]._id;

          // Update Party Balances
          saleParty.balance = Number(saleParty.balance) + amountToPay;
          await saleParty.save(); // { session }

          accRecParty.balance = Number(accRecParty.balance) + amountToPay; // Income increases
          await accRecParty.save(); // { session }
        }
      }
      // No explicit financial changes for 'due' status, as it's the default state.

      // --- 7. Update Order in Database ---
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        updateFields,
        { new: true, runValidators: true } // `new: true` returns the updated doc
      ); // { session }

      if (!updatedOrder) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 404, {
          message: "Order not found after update attempt.",
        });
      }

      // --- Commit Transaction ---
      // if (session) await session.commitTransaction();

      responseReturn(res, 200, {
        order: updatedOrder,
        message: `Order status updated to '${newStatus}' successfully`,
      });
    } catch (error) {
      console.error("Error in update_order_status:", error);

      // --- Rollback Transaction on Error ---
      // if (session) {
      //     await session.abortTransaction();
      //     console.warn("MongoDB transaction aborted due to error.");
      // }

      if (error.name === "ValidationError") {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return responseReturn(res, 400, {
          message: "Validation error",
          errors,
        });
      }
      if (error.name === "CastError") {
        return responseReturn(res, 400, {
          message: "Invalid ID format provided.",
          details: error.message,
        });
      }
      responseReturn(res, 500, {
        message: "Server Error: Unable to update order status.",
        details: error.message,
      });
    } finally {
      // --- End Session (Important even if transaction is aborted) ---
      // if (session) {
      //     session.endSession();
      // }
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
    const { id, role } = req; // Assuming 'id' and 'role' are attached by authentication middleware
    const {
      cartItems,
      totalAmount,
      totalQuantity,
      discount,
      finalAmount,
      party,
      partyId,
      value, // 'value' is currently used only for startDate
      delivery,
      service,
      remark, // Added remark to destructuring
    } = req.body;

    let generatedByUserName;
    let companyId;
    let branchId = null; // Initialize as null for cases where staff is not applicable

    try {
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return responseReturn(res, 404, { error: "Staff user not found." });
        }
        branchId = staff.branchId;
        companyId = staff.companyId;
        generatedByUserName = staff.name;
      } else {
        // Assuming 'owner' role or similar for non-staff
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return responseReturn(res, 404, { error: "Owner user not found." });
        }
        companyId = owner.companyId;
        generatedByUserName = owner.name;
      }

      // Determine the date for the draft
      const tempDate = value?.startDate
        ? moment(value.startDate).toDate() // Convert to Date object if startDate exists
        : new Date(); // Use new Date() to capture current timestamp

      // Create the draft entry
      const draft = await draftModel.create({
        generatedBy: generatedByUserName,
        party: party,
        cartItems,
        totalAmount,
        totalQuantity,
        discount,
        finalAmount,
        delivery,
        service,
        date: tempDate,
        remark, // Saved remark
        partyId,
        companyId: companyId,
        ...(branchId && { branchId }), // Conditionally add branchId if it exists
      });

      // Update the table position
      const table = await tableModel.findById(partyId);
      if (!table) {
        console.warn(
          `Table with ID ${partyId} not found for draft ${draft._id}.`
        );
      } else {
        table.position = "booked";
        await table.save();
      }

      responseReturn(res, 201, {
        draft,
        message: "Pre-order generated successfully",
      });
    } catch (error) {
      console.error("Error in make_draft:", error); // Log the actual error for debugging
      responseReturn(res, 500, { error: "Internal server error." });
    }
  };

  get_company_drafts = async (req, res) => {
    const { id } = req;
    var { companyId } = await ownerModel.findById(id);
    try {
      const drafts = await draftModel
        .find({ companyId: companyId })
        .sort({ date: -1 });
      const totalDrafts = await draftModel
        .find({ companyId: companyId })
        .countDocuments();

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
    const tempDate = moment(Date.now()).format("YYYY-MM-DD");
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
    const updateDate = moment(Date.now()).format("YYYY-MM-DD");
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
      totalAmount, // This is the calculated totalGuest * perHead
      remark, // Added remark from frontend
      discount,
      finalAmount, // This is totalAmount + charges - discount
      hallCharge,
      decoration,
      service,
      guestId,
      totalGuest,
      due,
      paid, // This is the full paidInfo array from frontend, including new payment
      programDate,
      hall,
      programType,
      perHead,
      reference,
      season,
    } = req.body;

    let companyId;
    let generatedByName;
    let branchId = null; // Initialize branchId to null

    let session = null; // For MongoDB transaction

    try {
      // --- Start MongoDB Session for Transaction (Highly Recommended) ---
      // Uncomment these lines if you have MongoDB transactions configured and enabled
      // session = await mongoose.startSession();
      // session.startTransaction();

      // --- 1. Determine User Role and Fetch Company/Name ---
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        generatedByName = staff.name;
        branchId = staff.branchId; // Get branchId for staff
      } else {
        // Role is owner
        const owner = await ownerModel.findById(id);
        if (!owner) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
        generatedByName = owner.name;
      }

      if (!companyId) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, { message: "Company ID not found." });
      }

      // --- Basic Input Validation (more detailed validation recommended with Joi/Express-validator) ---
      if (
        !hall ||
        !programType ||
        !reference ||
        !guestId ||
        !totalGuest ||
        !perHead ||
        !programDate ||
        !foodItems ||
        foodItems.length === 0
      ) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message:
            "Missing required program fields (hall, programType, reference, guestId, totalGuest, perHead, programDate, foodItems).",
        });
      }
      if (Number(totalGuest) <= 0 || Number(perHead) <= 0) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Total guest and per head must be positive numbers.",
        });
      }

      const tempDate = moment().format("YYYY-MM-DD"); // Current date for `bookedDate` and transactions
      const programFormattedDate = moment(programDate).format("YYYY-MM-DD"); // Program event date
      const [credit_party, discount_party, debit_party] = await Promise.all([
        partyModel.findOne({
          accountType: "income",
          under: "restaurant",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "discount",
          under: "restaurant",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "cash_restaurant",
          under: "restaurant",
          companyId: companyId,
        }), // TEMPORARY FIX: Added trailing space
      ]);

      if (!credit_party || !debit_party || !discount_party) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 500, {
          message:
            "Required financial accounts not found. Please set up 'income', 'discount', and 'cash_restaurant' parties.",
        });
      }

      // Determine the *new* paid amount (from the last entry in the `paid` array if it's there)
      // Frontend sends a consolidated `paid` array, so we need the newly added part.
      // Assuming `paid` array contains at least one object with `paid` property from frontend.
      const newPaymentAmount =
        paid.length > 0 ? Number(paid[paid.length - 1].paid) : 0;

      const UniqueId = Date.now().toString(36).toUpperCase(); // Unique ID for transactions

      // Generate new program number
      const lastProgram = await programModel
        .findOne({ companyId: companyId })
        .sort({ programNo: -1 })
        .limit(1);
      const newProgramNo =
        (lastProgram?.programNo ? Number(lastProgram.programNo) : 30000) + 1;

      let programTransactionId = null; // To store the ID of the main program transaction
      let discountTransactionId = null; // To store the ID of the discount transaction

      // --- Create Transactions ---
      // Create main transaction for payment if amount is paid
      if (newPaymentAmount > 0) {
        const mainTransaction = await transactionModel.create([
          {
            transactionNo: UniqueId + "-PAY",
            debit: debit_party._id, // Direct ID from findOne()
            credit: credit_party._id, // Direct ID from findOne()
            generatedBy: generatedByName,
            balance: newPaymentAmount,
            date: tempDate,
            orderNo: newProgramNo,
            companyId: companyId,
            branchId: branchId, // Include branchId if staff
          },
        ]); // { session } if using transactions
        programTransactionId = mainTransaction[0]._id;
      }

      // Create discount transaction if discount is applied
      if (Number(discount) > 0) {
        const discountTransaction = await transactionModel.create([
          {
            transactionNo: UniqueId + "-DISCOUNT",
            debit: discount_party._id, // Direct ID from findOne()
            credit: credit_party._id, // Direct ID from findOne()
            generatedBy: generatedByName,
            balance: Number(discount),
            date: tempDate,
            orderNo: newProgramNo,
            companyId: companyId,
            branchId: branchId, // Include branchId if staff
          },
        ]); // { session } if using transactions
        discountTransactionId = discountTransaction[0]._id;
      }

      // --- Create Program Record ---
      const program = await programModel.create([
        {
          programNo: newProgramNo,
          // transactionId: programTransactionId, // Link main transaction ID
          // If you want to store multiple transaction IDs, change this field to an array in schema
          // and push both programTransactionId and discountTransactionId here.
          transactionId: programTransactionId, // Storing only the main transaction ID as per schema
          guestId: guestId,
          generatedBy: generatedByName,
          foodItems: foodItems, // Frontend sends array of { _id, name }
          totalAmount: Number(totalAmount),
          totalGuest: Number(totalGuest),
          discount: Number(discount),
          service: Number(service),
          hallCharge: Number(hallCharge),
          decoration: Number(decoration),
          finalAmount: Number(finalAmount),
          bookedDate: tempDate, // Date when the program was booked
          due: Number(due),
          paid: paid, // Full array of paid info
          programDate: programFormattedDate, // Date of the actual program event
          hall: hall,
          programType: programType,
          perHead: Number(perHead),
          reference: reference,
          season: season,
          remark: remark, // Include remark
          companyId: companyId,
          branchId: branchId, // Include branchId if staff
        },
      ]); // { session } if using transactions

      // --- Update Party Balances (after successful program and transaction creation) ---
      // Cash account increases by what was paid
      if (newPaymentAmount > 0) {
        debit_party.balance = Number(debit_party.balance) + newPaymentAmount;
        await debit_party.save(); // { session } if using transactions
      }

      // Discount account (contra-income/expense) increases by discount given
      if (Number(discount) > 0) {
        discount_party.balance =
          Number(discount_party.balance) + Number(discount);
        await discount_party.save(); // { session } if using transactions
      }

      // Income account (credit_party - hot_sales_account/income) increases by the final amount of the program
      // This is typically the net revenue recognized from the program.
      credit_party.balance = Number(credit_party.balance) + Number(finalAmount);
      await credit_party.save(); // { session } if using transactions

      // --- Commit Transaction and Send Response ---
      // if (session) await session.commitTransaction();

      const createdProgram = await programModel
        .findById(program[0]._id)
        .populate("guestId")
        .populate("companyId")
        .populate("branchId");
      // No need to populate foodItems if they are just objects with _id and name
      // If you changed foodItems schema to ref "foods", then populate like:
      // .populate('foodItems._id')
      responseReturn(res, 201, {
        program: createdProgram,
        message: "Program placed successfully",
      });
    } catch (error) {
      console.error("Error in new_program:", error);

      // --- Rollback Transaction on Error ---
      // if (session) {
      //     await session.abortTransaction();
      //     console.warn("MongoDB transaction aborted due to error.");
      // }

      // Mongoose validation error handling
      if (error.name === "ValidationError") {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return responseReturn(res, 400, {
          message: "Validation error",
          errors,
        });
      }
      if (error.name === "CastError") {
        return responseReturn(res, 400, {
          message: "Invalid ID format provided.",
          details: error.message,
        });
      }
      responseReturn(res, 500, {
        message: "Server Error: Unable to create new program.",
        details: error.message,
      });
    } finally {
      // --- End Session (Important even if transaction is aborted) ---
      // if (session) {
      //     session.endSession();
      // }
    }
  };
  // all_programs = async (req, res) => {
  //   const { id } = req;

  //   var { companyId } = await ownerModel.findById(id);
  //   try {
  //     const programs = await programModel
  //       .find({ companyId: companyId })
  //       .populate("guestId")
  //       .sort({ createdAt: -1 });
  //     const totalPrograms = await programModel
  //       .find({ companyId: companyId })
  //       .countDocuments();

  //     responseReturn(res, 200, {
  //       programs,
  //       totalPrograms,
  //     });
  //   } catch (error) {
  //     responseReturn(res, 500, { error: "Internal server error" });
  //   }
  // };

  all_programs = async (req, res) => {
    try {
      const { id, role } = req;
      const currentPage = Math.max(1, parseInt(req.query.page) || 1);
      const itemsPerPage = Math.min(
        100,
        Math.max(1, parseInt(req.query.perPage) || 10)
      );
      const statusFilter = req.query.status;
      const searchQuery =
        typeof req.query.searchQuery === "string"
          ? req.query.searchQuery.trim()
          : "";
      console.log(searchQuery);
      // Get company ID based on role
      let companyId;
      if (role === "staff") {
        const staff = await staffModel.findById(id).select("companyId");
        if (!staff)
          return responseReturn(res, 404, { message: "Staff not found" });
        companyId = staff.companyId;
      } else {
        const owner = await ownerModel.findById(id).select("companyId");
        if (!owner)
          return responseReturn(res, 404, { message: "Owner not found" });
        companyId = owner.companyId;
      }

      // Build the base query
      const query = { companyId };

      // Add status filter if valid
      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      // Enhanced search functionality
      if (searchQuery) {
        // First try to find matching guests
        const matchingGuests = await guestModel
          .find({
            companyId,
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { mobile: { $regex: searchQuery, $options: "i" } },
            ],
          })
          .select("_id");

        // Build search conditions
        const searchConditions = [
          { source: { $regex: searchQuery, $options: "i" } },
          { remark: { $regex: searchQuery, $options: "i" } },
        ];

        // If we found matching guests, add their IDs to search conditions
        if (matchingGuests.length > 0) {
          searchConditions.push({
            guestId: { $in: matchingGuests.map((g) => g._id) },
          });
        }

        query.$or = searchConditions;
      }

      // Execute queries in parallel
      const [programs, totalPrograms] = await Promise.all([
        programModel
          .find(query)
          .populate({
            path: "guestId",
            select: "name mobile address",
          })
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * itemsPerPage)
          .limit(itemsPerPage)
          .lean(),

        programModel.countDocuments(query),
      ]);

      // Format the response
      const response = {
        totalPrograms,
        currentPage,
        totalPages: Math.ceil(totalPrograms / itemsPerPage),
        programs: programs.map((res) => ({
          ...res,
          guestName: res.guestId?.name || "Unknown Guest",
          guestMobile: res.guestId?.mobile || "",
        })),
      };
      // Debug log
      return responseReturn(res, 200, response);
    } catch (error) {
      console.error("Search error:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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
    const { id, role } = req; // Authenticated user ID and role
    const {
      foodItems, // Array of selected food items (from frontend)
      totalAmount, // Calculated total based on guests * perHead
      remark, // Program remark
      discount, // Total discount for the program
      finalAmount, // Final amount after all charges and discount
      hallCharge,
      decoration,
      service,
      guestId, // Guest ID
      totalGuest,
      due,
      paid, // Full array of paid info (including new payments)
      programDate, // Date of the program event
      hall,
      programType,
      perHead,
      reference,
      season,
      programId, // ID of the program to update (from frontend payload)
    } = req.body;

    let companyId;
    let generatedByName;
    let branchId = null; // Initialize branchId

    let session = null; // For MongoDB transaction

    try {
      // --- Start MongoDB Session for Transaction (Highly Recommended) ---
      // Uncomment these lines if you have MongoDB transactions configured and enabled
      // session = await mongoose.startSession();
      // session.startTransaction();

      // --- 1. Determine User Role and Fetch Company/Name ---
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        generatedByName = staff.name;
        branchId = staff.branchId; // Get branchId for staff
      } else {
        // Role is owner
        const owner = await ownerModel.findById(id);
        if (!owner) {
          // if (session) await session.abortTransaction();
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
        generatedByName = owner.name;
      }

      if (!companyId) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, { message: "Company ID not found." });
      }

      // --- Basic Input Validation (consider a dedicated validation middleware for more robust checks) ---
      if (!mongoose.Types.ObjectId.isValid(programId)) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Invalid Program ID format.",
        });
      }
      if (
        !hall ||
        !programType ||
        !reference ||
        !guestId ||
        !totalGuest ||
        !perHead ||
        !programDate ||
        !foodItems ||
        foodItems.length === 0
      ) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message:
            "Missing required program fields (hall, programType, reference, guestId, totalGuest, perHead, programDate, foodItems).",
        });
      }
      if (Number(totalGuest) <= 0 || Number(perHead) <= 0) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Total guest and per head must be positive numbers.",
        });
      }

      const tempDate = moment().format("YYYY-MM-DD"); // Current server date for transaction dates
      const programFormattedDate = moment(programDate).format("YYYY-MM-DD"); // Date of the actual program event

      // --- Fetch Existing Program to Compare Changes ---
      const existingProgram = await programModel.findById(programId); // { session } if using transactions
      if (!existingProgram) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 404, { message: "Program not found." });
      }

      // --- Fetch Financial Parties ---
      const [credit_party, discount_party, debit_party] = await Promise.all([
        partyModel.findOne({
          accountType: "income",
          under: "restaurant",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "discount",
          under: "restaurant",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "cash_restaurant",
          under: "restaurant",
          companyId: companyId,
        }), // TEMPORARY FIX: Includes trailing space as per previous debug. REMOVE THIS SPACE AFTER DATABASE CLEANUP.
      ]);

      if (!credit_party || !debit_party || !discount_party) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 500, {
          message:
            "Required financial accounts not found. Please set up 'income', 'discount', and 'cash_restaurant' parties under 'restaurant' for this company. Check for trailing spaces in accountType fields!",
        });
      }

      // --- Calculate Financial Deltas for Transactions ---
      // Calculate the difference in paid amount
      const previousTotalPaid =
        existingProgram.paid?.reduce((sum, p) => sum + Number(p.paid), 0) || 0;
      const currentTotalPaidInRequest = paid.reduce(
        (sum, p) => sum + Number(p.paid),
        0
      );
      const newPaidAmountInThisRequest =
        currentTotalPaidInRequest - previousTotalPaid;

      // Calculate the difference in discount
      const previousDiscount = Number(existingProgram.discount) || 0;
      const currentDiscount = Number(discount);
      const discountDifference = currentDiscount - previousDiscount;

      const UniqueId = Date.now().toString(36).toUpperCase(); // Unique ID for new transactions

      let programTransactionId = existingProgram.transactionId; // Keep existing if no new main transaction
      let newDiscountTransactionId = null; // New ID for discount transaction if created

      // --- Create New Transactions for Deltas ---
      // Create main transaction for NEW payment if applicable
      if (newPaidAmountInThisRequest > 0) {
        const mainTransaction = await transactionModel.create([
          {
            transactionNo: UniqueId + "-PAY",
            debit: debit_party._id,
            credit: credit_party._id,
            generatedBy: generatedByName,
            balance: newPaidAmountInThisRequest,
            date: tempDate,
            orderNo: existingProgram.programNo, // Link to existing program's number
            companyId: companyId,
            branchId: branchId,
          },
        ]); // { session }
        programTransactionId = mainTransaction[0]._id; // Update transactionId if a new main transaction was created
      }

      // Create a new discount transaction only if discount amount has actually changed
      if (discountDifference !== 0) {
        const discountTransaction = await transactionModel.create([
          {
            transactionNo: UniqueId + "-DISCOUNT",
            debit: discount_party._id,
            credit: credit_party._id, // Discounts reduce income from accounting perspective
            generatedBy: generatedByName,
            balance: Math.abs(discountDifference), // Use absolute value for the balance of the transaction
            date: tempDate,
            orderNo: existingProgram.programNo,
            companyId: companyId,
            branchId: branchId,
          },
        ]); // { session }
        newDiscountTransactionId = discountTransaction[0]._id;
      }

      // --- Prepare Update Object for Program ---
      const programUpdateFields = {
        guestId: guestId,
        generatedBy: generatedByName, // Update generatedBy on every change if desired
        foodItems: foodItems, // Frontend sends entire updated array, so directly set
        totalAmount: Number(totalAmount),
        totalGuest: Number(totalGuest),
        discount: Number(discount),
        service: Number(service),
        hallCharge: Number(hallCharge),
        decoration: Number(decoration),
        finalAmount: Number(finalAmount),
        // bookedDate: existingProgram.bookedDate, // bookedDate should generally not change
        programDate: programFormattedDate, // Update program event date
        hall: hall,
        programType: programType,
        perHead: Number(perHead),
        reference: reference,
        season: season,
        remark: remark, // Include remark
        paid: paid, // Frontend sends entire updated array, so directly set
        due: Number(due), // Update due directly
        transactionId: programTransactionId, // Link main transaction ID (or manage as an array if multiple)
        // If you want to store multiple transaction IDs, change `transactionId` in schema to an array
        // and push `programTransactionId` and `newDiscountTransactionId` here.
        companyId: companyId, // Should generally not change after creation
        branchId: branchId, // Should generally not change after creation
      };

      // --- Update Program Document in Database ---
      const updatedProgram = await programModel.findByIdAndUpdate(
        programId,
        programUpdateFields,
        { new: true, runValidators: true } // `new: true` returns the updated doc, `runValidators: true` runs schema validators
      ); // { session }

      if (!updatedProgram) {
        // if (session) await session.abortTransaction();
        return responseReturn(res, 404, {
          message: "Program not found after update attempt.",
        });
      }

      // --- Update Party Balances (after successful program and transaction creation) ---
      // 1. Debit Party (Cash) - Increases with new payments
      if (newPaidAmountInThisRequest > 0) {
        debit_party.balance =
          Number(debit_party.balance) + newPaidAmountInThisRequest;
        await debit_party.save(); // { session }
      }

      // 2. Discount Party - Adjusts based on discount change
      if (discountDifference !== 0) {
        // If discount increased (more discount given), balance of discount party increases (like an expense)
        // If discount decreased (less discount given), balance of discount party decreases (like a revenue adjustment)
        discount_party.balance =
          Number(discount_party.balance) + discountDifference; // Add the difference
        await discount_party.save(); // { session }
      }

      // 3. Credit Party (Income) - Adjusts based on change in net revenue (finalAmount)
      // This is crucial: the income account should reflect the *change* in net revenue from this program.
      const previousFinalAmount = Number(existingProgram.finalAmount) || 0;
      const finalAmountDifference = Number(finalAmount) - previousFinalAmount;

      if (finalAmountDifference !== 0) {
        credit_party.balance =
          Number(credit_party.balance) + finalAmountDifference;
        await credit_party.save(); // { session }
      }

      // --- Commit Transaction and Send Response ---
      // if (session) await session.commitTransaction();

      const populatedProgram = await programModel
        .findById(updatedProgram._id)
        .populate("guestId")
        .populate("companyId")
        .populate("branchId");

      responseReturn(res, 200, {
        program: populatedProgram,
        message: "Program updated successfully",
      });
    } catch (error) {
      console.error("Error in update_program:", error);

      // --- Rollback Transaction on Error ---
      // if (session) {
      //     await session.abortTransaction();
      //     console.warn("MongoDB transaction aborted due to error.");
      // }

      // Mongoose validation error handling
      if (error.name === "ValidationError") {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return responseReturn(res, 400, {
          message: "Validation error",
          errors,
        });
      }
      if (error.name === "CastError") {
        return responseReturn(res, 400, {
          message: "Invalid ID format provided.",
          details: error.message,
        });
      }
      responseReturn(res, 500, {
        message: "Server Error: Unable to update program.",
        details: error.message,
      });
    } finally {
      // --- End Session (Important even if transaction is aborted) ---
      // if (session) {
      //     session.endSession();
      // }
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
  // Ensure moment is imported if not already

  new_reservation = async (req, res) => {
    const { id, role } = req;

    // Destructure roomDetails, others, and restaurants directly from req.body
    // Remove individual room-related fields (roomId, rackRate, discountRate, category, dayStay)
    // as they are now encapsulated within the roomDetails array.
    const {
      startDate,
      endDate,
      roomDetails, // This will be the array of room objects from the frontend
      totalGuest,
      guestId,
      totalAmount,
      source,
      others, // This should be an array of objects
      restaurants, // This should be an array of objects
      due,
      discount,
      paidInfo,
      finalAmount,
      status,
      remark,
      billTransfer, // This should be the roomId (ObjectId) if selected
    } = req.body;
    let companyId, generatedByName, branchId;

    try {
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        generatedByName = staff.name;
        branchId = staff.branchId;
      } else {
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
        generatedByName = owner.name;
        branchId = null;
      }

      if (!companyId) {
        return responseReturn(res, 400, {
          message: "Company ID not found for the user.",
        });
      }

      const tempDate = moment().format("YYYY-MM-DD");
      const checkInDate = moment(startDate).format("YYYY-MM-DD");
      const checkOutDate = moment(endDate).format("YYYY-MM-DD");
      const UniqueId = Date.now().toString(36).toUpperCase();

      const lastReservation = await reservationModel
        .findOne({ companyId })
        .sort({ createdAt: -1 })
        .select("reservationNo");

      let newReservationId;
      if (lastReservation && lastReservation.reservationNo) {
        newReservationId = Number(lastReservation.reservationNo) + 1;
      } else {
        newReservationId = 30001;
      }

      const [credit_party, discount_party, debit_party] = await Promise.all([
        partyModel.findOne({
          accountType: "hot_sales_account",
          under: "hotel",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "discount",
          under: "hotel",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "cash_hotel",
          under: "hotel",
          companyId: companyId,
        }),
      ]);

      if (!credit_party || !debit_party || !discount_party) {
        return responseReturn(res, 500, {
          message:
            "Required financial accounts not found. Please ensure 'hot_sales_account', 'discount', and 'cash_hotel' parties are set up for your company.",
        });
      }

      const lastPaid =
        paidInfo && paidInfo.length > 0
          ? Number(paidInfo[paidInfo.length - 1].paid)
          : 0;

      const getRes = restaurants?.reduce(
        (n, { restaurantAmount }) => n + restaurantAmount,
        0
      );
      const updateRes =
        getRes > 0
          ? others // Convert to Date object if startDate exists
          : null;

      const getOther = others?.reduce(
        (n, { otherAmount }) => n + otherAmount,
        0
      );
      const updateOthers =
        getOther > 0
          ? others // Convert to Date object if startDate exists
          : null;

      // billTransfer should be an ObjectId of the room, not its name.
      // The frontend should send the room's _id if a bill transfer is selected.
      let transferRoomId = null;
      if (billTransfer) {
        // billTransfer from frontend is already the room's _id
        const roomToTransfer = await roomModel.findById(billTransfer);
        if (!roomToTransfer) {
          // Handle case where billTransfer room ID is invalid/not found
          return responseReturn(res, 400, {
            message: "Invalid Room ID for Bill Transfer.",
          });
        }
        transferRoomId = billTransfer; // Store the ObjectId directly
      }

      let mainTransaction = await transactionModel.create({
        transactionNo: UniqueId,
        debit: debit_party._id,
        credit: credit_party._id,
        generatedBy: generatedByName,
        balance: lastPaid,
        date: tempDate,
        orderNo: newReservationId,
        companyId: companyId,
        branchId: branchId,
      });

      let discountTransaction = null;
      if (Number(discount) > 0) {
        discountTransaction = await transactionModel.create({
          transactionNo: UniqueId,
          debit: discount_party._id,
          credit: credit_party._id,
          generatedBy: generatedByName,
          balance: Number(discount),
          date: tempDate,
          orderNo: newReservationId,
          companyId: companyId,
          branchId: branchId,
        });
      }

      // Use the roomDetails array directly from the frontend payload
      // Ensure roomDetails is an array and each item has the expected fields
      if (!Array.isArray(roomDetails) || roomDetails.length === 0) {
        return responseReturn(res, 400, {
          message: "Room details are required for the reservation.",
        });
      }

      // It's a good practice to validate the structure of each roomDetail here
      // For example, ensuring roomId is a valid ObjectId, and rates are numbers.
      const validatedRoomDetails = roomDetails.map((room) => {
        if (
          !room.roomId ||
          !moment.isMoment(moment(room.checkInDate)) ||
          !moment.isMoment(moment(room.checkOutDate)) ||
          typeof room.rackRate !== "number" ||
          typeof room.discountRate !== "number" ||
          !room.category ||
          typeof room.dayStay !== "number"
        ) {
          throw new Error("Invalid room detail structure provided."); // Or return a specific error message
        }
        return {
          roomId: room.roomId,
          rackRate: room.rackRate,
          discountRate: room.discountRate,
          category: room.category,
          dayStay: room.dayStay,
          // If individual checkInDate/checkOutDate are sent for each room in roomDetails, include them here:
          // checkInDate: moment(room.checkInDate).format("YYYY-MM-DD"),
          // checkOutDate: moment(room.checkOutDate).format("YYYY-MM-DD"),
        };
      });

      const reservationData = {
        reservationNo: newReservationId,
        transactionId: mainTransaction._id,
        residentId: guestId,
        generatedBy: generatedByName,
        roomDetails: validatedRoomDetails, // Use the validated roomDetails array
        // Use others and restaurants directly as they are now arrays from frontend
        others: updateOthers,
        restaurants: updateRes,
        totalAmount,
        totalGuest,
        discount: Number(discount),
        finalAmount,
        due,
        paidInfo,
        bookedDate: tempDate,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        source,
        status,
        remark,
        billTransfer: transferRoomId, // Store the ObjectId
        companyId: companyId,
        branchId: branchId,
      };

      let newReservation = await reservationModel.create(reservationData);

      debit_party.balance = Number(debit_party.balance) + lastPaid;
      await debit_party.save();

      if (discountTransaction) {
        discount_party.balance =
          Number(discount_party.balance) + Number(discount);
        await discount_party.save();
      }

      credit_party.balance = Number(credit_party.balance) + (totalAmount - due);
      await credit_party.save();

      // Populate for response - ensure `roomDetails.roomId` is correctly populated
      newReservation = await reservationModel
        .findById(newReservation._id)
        .populate("residentId")
        .populate({
          path: "roomDetails.roomId", // Path for array subdocument population
          populate: {
            path: "categoryId",
          },
        });

      responseReturn(res, 201, {
        reservation: newReservation,
        message: "Reservation placed successfully!",
      });
    } catch (error) {
      console.error("Error creating new reservation:", error); // Use console.error

      if (error.name === "CastError" && error.kind === "ObjectId") {
        return responseReturn(res, 400, {
          message: "Invalid ID format provided in request.",
          details: error.message, // Add details for better debugging
        });
      }
      // Handle potential validation errors from Mongoose
      if (error.name === "ValidationError") {
        return responseReturn(res, 400, {
          message: "Validation failed: " + error.message,
          details: error.errors, // Mongoose validation errors
        });
      }

      // Catch the specific error thrown during roomDetails validation
      if (
        error.message &&
        error.message.includes("Invalid room detail structure provided.")
      ) {
        return responseReturn(res, 400, {
          message: error.message,
        });
      }

      responseReturn(res, 500, {
        message: "Server Error: Unable to create new reservation.",
        details: error.message, // Provide error.message for server-side debugging
      });
    }
  };

  all_reservations = async (req, res) => {
    try {
      const { id, role } = req;
      const currentPage = Math.max(1, parseInt(req.query.page) || 1);
      const itemsPerPage = Math.min(
        100,
        Math.max(1, parseInt(req.query.perPage) || 10)
      );
      const statusFilter = req.query.status;
      const searchQuery =
        typeof req.query.searchQuery === "string"
          ? req.query.searchQuery.trim()
          : "";

      // Get company ID based on role
      let companyId;
      if (role === "staff") {
        const staff = await staffModel.findById(id).select("companyId");
        if (!staff)
          return responseReturn(res, 404, { message: "Staff not found" });
        companyId = staff.companyId;
      } else {
        const owner = await ownerModel.findById(id).select("companyId");
        if (!owner)
          return responseReturn(res, 404, { message: "Owner not found" });
        companyId = owner.companyId;
      }

      // Build the base query
      const query = { companyId };

      // Add status filter if valid
      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      // Enhanced search functionality
      if (searchQuery) {
        // First try to find matching guests
        const matchingGuests = await guestModel
          .find({
            companyId,
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { mobile: { $regex: searchQuery, $options: "i" } },
            ],
          })
          .select("_id");

        // Build search conditions
        const searchConditions = [
          { source: { $regex: searchQuery, $options: "i" } },
          { remark: { $regex: searchQuery, $options: "i" } },
        ];

        // If we found matching guests, add their IDs to search conditions
        if (matchingGuests.length > 0) {
          searchConditions.push({
            residentId: { $in: matchingGuests.map((g) => g._id) },
          });
        }

        query.$or = searchConditions;
      }

      // Execute queries in parallel
      const [reservations, totalReservations] = await Promise.all([
        reservationModel
          .find(query)
          .populate({
            path: "residentId",
            select: "name mobile address",
          })
          .populate({
            path: "roomDetails.roomId",
            select: "name category",
          })
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * itemsPerPage)
          .limit(itemsPerPage)
          .lean(),

        reservationModel.countDocuments(query),
      ]);

      // Format the response
      const response = {
        totalReservations,
        currentPage,
        totalPages: Math.ceil(totalReservations / itemsPerPage),
        reservations: reservations.map((res) => ({
          ...res,
          guestName: res.residentId?.name || "Unknown Guest",
          guestMobile: res.residentId?.mobile || "",
          rooms:
            res.roomDetails?.map((room) => ({
              id: room.roomId?._id,
              name: room.roomId?.name || "Unknown Room",
              category: room.roomId?.category || "Unknown",
            })) || [],
        })),
      };
      // Debug log
      return responseReturn(res, 200, response);
    } catch (error) {
      console.error("Search error:", error);
      return responseReturn(res, 500, {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
  get_a_reservation = async (req, res) => {
    const { reservationId } = req.params;
    try {
      const reservation = await reservationModel
        .findById(reservationId)
        .populate("residentId")
        .populate({
          path: "roomDetails.roomId",
          populate: {
            path: "categoryId", // Populate category inside the room
          },
        });
      responseReturn(res, 200, {
        reservation,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  update_reservation_status = async (req, res) => {
    const { reservationId } = req.params;
    const { status } = req.body;
    console.log(reservationId);
    try {
      const validStatuses = ["will_check", "check_in", "checked_out", "cancel"];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          message: "Invalid status provided.",
        }); // Using your response utility
      }
      const reservationToUpdate = await reservationModel.findById(
        reservationId
      );

      // Check if reservation exists before proceeding with any status logic
      if (!reservationToUpdate) {
        return responseReturn(res, 404, { message: "Reservation not found." });
      }
      const currentStatus = reservationToUpdate.status;

      // Frontend validation rules (backend should also have these for safety)
      if (currentStatus === "checked_in" && status === "will_check") {
        return responseReturn(res, 400, {
          message: "Cannot change status from 'Checked In' to 'Will Check'.",
        });
      }
      if (
        (currentStatus === "cancel" || currentStatus === "checked_out") &&
        (status === "checked_in" || status === "will_check")
      ) {
        return responseReturn(res, 400, {
          message: `Cannot change status from '${currentStatus}' to '${status}'. Reservation is already finalized.`,
        });
      }

      const tempDate = moment().format("YYYY-MM-DD"); // Current date for new transactions

      // --- Handle checkOutDate based on status ---
      if (status === "checked_out") {
        const currentCheckInDate = moment(reservationToUpdate.checkInDate);
        const today = moment(); // Or moment(Date.now()); both work

        // 1. Check if check-out is attempted before actual check-in date
        if (currentCheckInDate.isAfter(today, "day")) {
          return responseReturn(res, 400, {
            message:
              "Cannot mark as 'Checked Out': Check-in date is in the future.",
          });
        }

        // 2. Check if there's any outstanding balance
        if (Number(reservationToUpdate.finalAmount) !== 0) {
          // Using Number() here ensures it's treated as a number
          return responseReturn(res, 400, {
            message:
              "Cannot mark as 'Checked Out': Outstanding balance needs to be cleared.",
          });
        }
        const updatedReservation = await reservationModel.findByIdAndUpdate(
          reservationId,
          { checkOutDate: tempDate },
          { new: true, runValidators: true }
        );
      }

      if (status === "cancel") {
        return responseReturn(res, 400, {
          message: "Remark is required for cancellation.",
        });
      }
      // --- End of specific check-out logic ---

      // Proceed to update the status
      const updatedReservation = await reservationModel.findByIdAndUpdate(
        reservationId,
        { status: status },
        { new: true, runValidators: true }
      );

      // This check for !updatedReservation might be redundant here if reservationToUpdate already exists,
      // but it's good for robustness in case findByIdAndUpdate fails for another reason (e.g., deleted during the process).
      if (!updatedReservation) {
        return responseReturn(res, 404, {
          message: "Reservation not found after update attempt.",
        });
      }

      // Send back a success response
      responseReturn(res, 200, {
        message: "Reservation status has been changed!",
        reservation: updatedReservation, // Optionally send the updated reservation data back
      });
    } catch (error) {
      console.error("Error updating reservation status:", error.message);
      // Handle invalid MongoDB ID format specifically
      if (error.kind === "ObjectId") {
        return responseReturn(res, 400, {
          message: "Invalid Reservation ID format.",
        });
      }
      responseReturn(res, 500, { message: "Server Error" });
    }
  };

  update_reservation = async (req, res) => {
    const { id, role } = req; // Assuming 'id' is userId/staffId/ownerId from auth middleware
    const {
      startDate, // New check-in date from frontend
      endDate, // New check-out date from frontend
      roomDetails, // This will now be an array of room objects for the current reservation
      totalGuest,
      guestId,
      totalAmount, // Calculated total amount for the current reservation (after updates)
      source,
      others, // This will now be an array of other service objects from frontend
      restaurants, // This will now be an array of restaurant service objects from frontend
      due, // Calculated due amount for the current reservation
      discount, // Calculated discount for the current reservation
      paidInfo, // This will be the full updated array of payment infos for the current reservation
      finalAmount, // Calculated final amount for the current reservation
      status, // New status for the current reservation
      remark, // New remark for the current reservation
      billTransfer, // Room ID for bill transfer, if applicable (the ROOM being transferred TO)
      reservationId, // ID of the reservation being UPDATED (and potentially cancelled)
    } = req.body;

    let companyId, generatedByName;
    let createdTransactionIds = []; // To track created transactions for potential rollback
    let session = null; // For MongoDB transaction

    try {
      // Start a MongoDB session for transaction (if your MongoDB version supports it and you configure it)
      // This part is crucial for atomicity. If not using transactions, be aware of data inconsistencies.
      // session = await mongoose.startSession();
      // session.startTransaction();

      // --- 1. Determine User Role and Fetch Company/Name ---
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return responseReturn(res, 404, { message: "Staff not found." });
        }
        companyId = staff.companyId;
        generatedByName = staff.name;
      } else {
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return responseReturn(res, 404, { message: "Owner not found." });
        }
        companyId = owner.companyId;
        generatedByName = owner.name;
      }

      if (!companyId) {
        return responseReturn(res, 400, { message: "Company ID not found." });
      }

      const tempDate = moment().format("YYYY-MM-DD"); // Current server date for new transactions/cancellation

      // --- Fetch Financial Parties ---
      const [credit_party, discount_party, debit_party] = await Promise.all([
        partyModel.findOne({
          accountType: "hot_sales_account",
          under: "hotel",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "discount",
          under: "hotel",
          companyId: companyId,
        }),
        partyModel.findOne({
          accountType: "cash_hotel",
          under: "hotel",
          companyId: companyId,
        }),
      ]);

      if (!credit_party || !debit_party || !discount_party) {
        // await session.abortTransaction(); // Abort transaction on error
        return responseReturn(res, 500, {
          message:
            "Required financial accounts not found. Please set up 'hot_sales_account', 'discount', and 'cash_hotel' parties.",
        });
      }
      console.log(reservationId);

      // Fetch the reservation being updated/cancelled
      const existingReservation = await reservationModel
        .findById(reservationId)
        .populate("roomDetails.roomId"); // Populate to get room names/categories if needed

      if (!existingReservation) {
        // await session.abortTransaction(); // Abort transaction on error
        return responseReturn(res, 404, { message: "Reservation not found." });
      }

      const currentStatus = existingReservation.status;

      // --- Frontend-like Status Transition Validation (Backend safety) ---
      if (currentStatus === "checked_in" && status === "will_check") {
        // await session.abortTransaction();
        return responseReturn(res, 400, {
          message: "Cannot change status from 'Checked In' to 'Will Check'.",
        });
      }
      if (
        (currentStatus === "cancel" || currentStatus === "checked_out") &&
        (status === "checked_in" || status === "will_check")
      ) {
        // await session.abortTransaction();
        return responseReturn(res, 400, {
          message: `Cannot change status from '${currentStatus}' to '${status}'. Reservation is already finalized.`,
        });
      }

      // --- Handle checkOutDate based on status ---
      let finalCheckOutDate; // Declared here
      if (status === "checked_out" || status === "cancel") {
        finalCheckOutDate = tempDate; // Assigned here
      } else {
        finalCheckOutDate = moment(endDate).format("YYYY-MM-DD"); // Assigned here
      }
      const finalCheckInDate = moment(startDate).format("YYYY-MM-DD");

      // --- BILL TRANSFER LOGIC ---
      if (
        billTransfer &&
        billTransfer !== "null" &&
        billTransfer !== "undefined"
      ) {
        // Check if billTransfer is provided
        // Validate billTransfer is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(billTransfer)) {
          // await session.abortTransaction();
          return responseReturn(res, 400, {
            message: "Invalid Room ID provided for Bill Transfer.",
          });
        }

        // 1. Find the target reservation for the bill transfer room on overlapping dates
        // Find a reservation for the 'billTransfer' room that is active on the current reservation's check-in date
        const targetReservation = await reservationModel
          .findOne({
            "roomDetails.roomId": billTransfer, // Check if the room exists in roomDetails
            companyId: companyId,
            status: { $nin: ["cancel", "checked_out"] }, // Target must be active
            checkInDate: { $lte: moment(endDate).format("YYYY-MM-DD") }, // Target starts on or before current reservation's new end date
            checkOutDate: { $gt: moment(startDate).format("YYYY-MM-DD") }, // Target ends after current reservation's new start date
            _id: { $ne: existingReservation._id }, // Cannot transfer to self
          })
          .populate("roomDetails.roomId"); // Populate to get details for logging/response

        if (!targetReservation) {
          // await session.abortTransaction();
          return responseReturn(res, 400, {
            message:
              "No active reservation found for the selected Bill Transfer Room on the overlapping dates.",
          });
        }

        // --- Accumulate data from existingReservation to targetReservation ---
        console.log(
          `Performing bill transfer from Reservation ${existingReservation.reservationNo} to ${targetReservation.reservationNo}`
        );

        // a. Transfer room details
        const roomsToTransfer = existingReservation.roomDetails.map(
          (detail) => ({
            roomId: detail.roomId._id, // Ensure it's the ID
            rackRate: detail.rackRate,
            discountRate: detail.discountRate,
            category: detail.roomId.categoryId?.name || detail.category, // Use populated name or original category
            dayStay: detail.dayStay,
          })
        );
        targetReservation.roomDetails.push(...roomsToTransfer);

        // b. Accumulate financial amounts (totalAmount, discount, due, finalAmount)
        targetReservation.totalAmount =
          (Number(targetReservation.totalAmount) || 0) +
          (Number(existingReservation.totalAmount) || 0);
        targetReservation.discount =
          (Number(targetReservation.discount) || 0) +
          (Number(existingReservation.discount) || 0);
        targetReservation.due =
          (Number(targetReservation.due) || 0) +
          (Number(existingReservation.due) || 0);
        targetReservation.finalAmount =
          (Number(targetReservation.finalAmount) || 0) +
          (Number(existingReservation.finalAmount) || 0);

        // c. Transfer paidInfo
        if (
          existingReservation.paidInfo &&
          existingReservation.paidInfo.length > 0
        ) {
          targetReservation.paidInfo.push(
            ...existingReservation.paidInfo.map((p) => ({
              paid: p.paid,
              paidDetails: p.paidDetails,
              currentDate: p.currentDate || new Date(), // Ensure date is present
            }))
          );
        }

        // d. Transfer other/restaurant charges (assuming single items in array as per frontend payload)
        if (
          existingReservation.others &&
          existingReservation.others.length > 0
        ) {
          targetReservation.others[0].otherAmount =
            (Number(targetReservation.others[0]?.otherAmount) || 0) +
            (Number(existingReservation.others[0]?.otherAmount) || 0);
          targetReservation.others[0].other =
            targetReservation.others[0]?.other ||
            existingReservation.others[0]?.other; // Keep existing or use transferred
        }
        if (
          existingReservation.restaurants &&
          existingReservation.restaurants.length > 0
        ) {
          targetReservation.restaurants[0].restaurantAmount =
            (Number(targetReservation.restaurants[0]?.restaurantAmount) || 0) +
            (Number(existingReservation.restaurants[0]?.restaurantAmount) || 0);
          targetReservation.restaurants[0].restaurant =
            targetReservation.restaurants[0]?.restaurant ||
            existingReservation.restaurants[0]?.restaurant;
        }

        // Save the updated target reservation
        await targetReservation.save(); // Pass { session } if using transactions

        // --- Mark the existingReservation (the one being updated) as 'cancel' ---
        existingReservation.status = "cancel";
        existingReservation.remark = `Bill transferred to Reservation ${
          targetReservation.reservationNo
        } (${
          targetReservation.roomDetails[0]?.roomId?.name || "Unknown Room"
        }) on ${tempDate}. Original remark: ${remark || "N/A"}`;
        existingReservation.checkOutDate = tempDate; // Set checkout date to now for cancellation

        // Clear financial amounts for the cancelled reservation
        existingReservation.totalAmount = 0;
        existingReservation.discount = 0;
        existingReservation.due = 0;
        existingReservation.finalAmount = 0;
        existingReservation.paidInfo = []; // Clear paid info

        await existingReservation.save(); // Pass { session } if using transactions

        // Send a specific response for bill transfer success
        // await session.commitTransaction();
        return responseReturn(res, 200, {
          message: `Bill successfully transferred from Reservation ${existingReservation.reservationNo} to ${targetReservation.reservationNo}. Original reservation cancelled.`,
          transferredFromReservation: existingReservation, // Return the cancelled reservation
          transferredToReservation: targetReservation, // Return the updated target reservation
        });
      }
      // --- END BILL TRANSFER LOGIC ---

      // This part runs ONLY IF NO BILL TRANSFER IS PERFORMED
      // Calculate the difference in paid amount for current reservation update
      const previousTotalPaid =
        existingReservation.paidInfo?.reduce((sum, p) => sum + p.paid, 0) || 0;
      const currentTotalPaidInRequest = paidInfo.reduce(
        (sum, p) => sum + p.paid,
        0
      );
      const newPaidAmountInThisRequest =
        currentTotalPaidInRequest - previousTotalPaid;

      const UniqueId = Date.now().toString(36).toUpperCase(); // Unique ID for transactions

      // --- Transaction Management for standard update ---
      let mainTransaction = null;
      let discountTransaction = null;
      let orderNoForTransactions = existingReservation.reservationNo; // Use existing reservation number

      // Create a new transaction only if there's a new payment
      if (newPaidAmountInThisRequest > 0) {
        mainTransaction = await transactionModel.create([
          {
            // Use array syntax for transactions, if needed, or just single create
            transactionNo: UniqueId + "-PAY",
            debit: debit_party._id,
            credit: credit_party._id,
            generatedBy: generatedByName,
            balance: Number(newPaidAmountInThisRequest),
            date: tempDate,
            orderNo: orderNoForTransactions,
            companyId: companyId,
          },
        ]); // Pass { session } if using transactions
        createdTransactionIds.push(mainTransaction[0]._id); // If using array syntax for create
      }

      // Create discount transaction only if discount amount has changed and is positive
      if (
        Number(discount) > 0 &&
        Number(discount) !== Number(existingReservation.discount || 0)
      ) {
        const discountDifference =
          Number(discount) - Number(existingReservation.discount || 0);

        if (discountDifference !== 0) {
          discountTransaction = await transactionModel.create([
            {
              transactionNo: UniqueId + "-DISCOUNT",
              debit: discount_party._id,
              credit: credit_party._id,
              generatedBy: generatedByName,
              balance: Math.abs(discountDifference),
              date: tempDate,
              orderNo: orderNoForTransactions,
              companyId: companyId,
            },
          ]); // Pass { session } if using transactions
          createdTransactionIds.push(discountTransaction[0]._id); // If using array syntax for create
        }
      }

      // --- Prepare Update Object for Reservation ---
      const reservationUpdateFields = {
        residentId: guestId,
        totalGuest: Number(totalGuest),
        source,
        remark,
        billTransfer: billTransfer || null,
        status,

        checkInDate: moment(startDate).format("YYYY-MM-DD"),
        checkOutDate: finalCheckOutDate, // Use the potentially updated finalCheckOutDate

        roomDetails: roomDetails.map((roomDet) => ({
          roomId: roomDet.roomId,
          rackRate: Number(roomDet.rackRate),
          discountRate: Number(roomDet.discountRate),
          category: roomDet.category,
          dayStay: Number(roomDet.dayStay),
        })),

        others:
          Array.isArray(others) && others.length > 0
            ? [
                {
                  other: others[0].other || "",
                  otherAmount: Number(others[0].otherAmount) || 0,
                },
              ]
            : [{ other: "", otherAmount: 0 }],
        restaurants:
          Array.isArray(restaurants) && restaurants.length > 0
            ? [
                {
                  restaurant: restaurants[0].restaurant || "",
                  restaurantAmount:
                    Number(restaurants[0].restaurantAmount) || 0,
                },
              ]
            : [{ restaurant: "", restaurantAmount: 0 }],

        totalAmount: Number(totalAmount),
        discount: Number(discount),
        due: Number(due),
        finalAmount: Number(finalAmount),
        paidInfo: paidInfo,
      };

      // If status is cancel, remark is required
      if (status === "cancel") {
        if (!remark || typeof remark !== "string" || remark.trim() === "") {
          // await session.abortTransaction();
          return responseReturn(res, 400, {
            message: "Remark is required for cancellation.",
          });
        }
      }

      // Status-specific validation for 'checked_out'
      if (status === "checked_out") {
        const currentCheckInDate = moment(existingReservation.checkInDate);
        const today = moment();

        if (currentCheckInDate.isAfter(today, "day")) {
          // await session.abortTransaction();
          return responseReturn(res, 400, {
            message:
              "Cannot mark as 'Checked Out': Check-in date is in the future.",
          });
        }
        if (Number(finalAmount) !== 0) {
          // await session.abortTransaction();
          return responseReturn(res, 400, {
            message:
              "Cannot mark as 'Checked Out': Outstanding balance needs to be cleared.",
          });
        }
        // When checking out, ensure checkOutDate is now
        reservationUpdateFields.checkOutDate = tempDate;
      }

      // --- Update Reservation in Database ---
      let updatedReservation = await reservationModel.findByIdAndUpdate(
        reservationId,
        reservationUpdateFields,
        { new: true, runValidators: true } // { session } if using transactions
      );

      if (!updatedReservation) {
        // await session.abortTransaction();
        return responseReturn(res, 404, {
          message: "Reservation not found after update attempt.",
        });
      }

      // --- Update Party Balances (after successful reservation update) ---
      // These updates happen only if a transaction was created for new payments or discount changes.
      if (newPaidAmountInThisRequest > 0) {
        debit_party.balance =
          Number(debit_party.balance) + newPaidAmountInThisRequest;
        await debit_party.save(); // { session } if using transactions
      }

      if (discountTransaction) {
        // The discount transaction already debits discount_party. Here we ensure it's saved.
        // Note: The previous logic was `Math.abs(Number(discount))`, which would keep increasing.
        // The `balance` of `discount_party` should ideally be the sum of all discounts *given*.
        // If `discountTransaction` was created for `discountDifference`, then that's the amount to add.
        // For simplicity, let's assume `discountTransaction`'s balance reflects the change.
        discount_party.balance =
          Number(discount_party.balance) +
          Number(discountTransaction[0]?.balance || 0);
        await discount_party.save(); // { session } if using transactions
      }

      // Credit party balance is implicitly updated by the `credit` fields in transactionModel.create.
      // If your transaction model doesn't handle party balance updates automatically via hooks,
      // you would need to add an explicit `credit_party.balance` update here based on `newPaidAmountInThisRequest`
      // or other revenue-generating changes. For robust accounting, this needs careful design.

      // --- Populate the newly created reservation for the response ---
      updatedReservation = await reservationModel
        .findById(updatedReservation._id)
        .populate("residentId")
        .populate({
          path: "roomDetails.roomId",
          populate: { path: "categoryId" },
        });

      // await session.commitTransaction(); // Commit transaction on success
      responseReturn(res, 200, {
        reservation: updatedReservation,
        message: "Reservation updated successfully",
      });
    } catch (error) {
      console.error("Error in update_reservation:", error);

      // if (session) {
      //     await session.abortTransaction(); // Abort transaction on any error
      //     console.warn("MongoDB transaction aborted due to error.");
      // }

      // Basic Rollback: Attempt to delete any transactions created in this failed update
      if (createdTransactionIds.length > 0) {
        console.warn(
          "Attempting to roll back transactions due to error:",
          createdTransactionIds
        );
        try {
          await transactionModel.deleteMany({
            _id: { $in: createdTransactionIds },
          });
        } catch (rollbackError) {
          console.error("Error during transaction rollback:", rollbackError);
        }
      }

      if (error.name === "CastError" && error.kind === "ObjectId") {
        return responseReturn(res, 400, {
          message: "Invalid ID format provided in request.",
          details: error.message,
        });
      }
      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        return responseReturn(res, 400, {
          message: error.message,
          details: error.errors,
        });
      }
      responseReturn(res, 500, {
        message: "Server Error: Unable to update reservation.",
        details: error.message,
      });
    } finally {
      // if (session) {
      //     session.endSession(); // End the session regardless of success or failure
      // }
    }
  };
  // Or however you export your controllers

  getReservationsByDateAndStatus = async (req, res) => {
    const { id, role } = req; // Authenticated user's ID and role
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const selectedDate = new Date(date);
    var inDate = moment(selectedDate).format("YYYY-MM-DD");

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    var outDate = moment(nextDay).format("YYYY-MM-DD");
    let companyId;

    try {
      // 1. Determine companyId
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return res.status(404).json({ message: "Staff not found." });
        }
        companyId = staff.companyId;
      } else {
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return res.status(404).json({ message: "Owner not found." });
        }
        companyId = owner.companyId;
      }

      if (!companyId) {
        return res.status(400).json({ message: "Company ID not found." });
      }

      // 2. Query reservations
      const reservations = await reservationModel
        .find({
          status: { $ne: "cancel" },
          checkInDate: { $lt: outDate },
          checkOutDate: { $gte: inDate },
          companyId: companyId,
        })
        .populate({
          path: "roomDetails.roomId", // Ensure room belongs to user's company
        })
        .populate("residentId")
        .lean();
      // 3. Filter out any reservation where roomId was not matched
      const validReservations = reservations.filter(
        (res) => res.roomDetails.roomId !== null
      );

      res.status(200).json({
        message: "Reservations fetched",
        reservations: validReservations,
      });
    } catch (err) {
      console.error("Reservation fetch error:", err);
      res.status(500).json({
        message: "Failed to fetch reservations",
        error: err.message,
      });
    }
  };

  getReservationsByDateAndStatusStayView = async (req, res) => {
    const { id, role } = req; // Authenticated user's ID and role
    const { startDate, numberOfDays } = req.query; // Expecting startDate and numberOfDays

    if (!startDate || !numberOfDays) {
      return res
        .status(400)
        .json({ message: "Start date and number of days are required." });
    }

    // Define the full date range for the query
    const rangeStartDate = moment(startDate).startOf("day"); // Inclusive start
    const rangeEndDate = moment(startDate)
      .add(parseInt(numberOfDays), "days")
      .startOf("day"); // Exclusive end
    const finalEndDate = moment(rangeEndDate).format("YYYY-MM-DD");
    const finalStartDate = moment(rangeStartDate).format("YYYY-MM-DD");
    if (!rangeStartDate.isValid() || !rangeEndDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format provided." });
    }

    let companyId;

    try {
      // 1. Determine companyId
      if (role === "staff") {
        const staff = await staffModel.findById(id);
        if (!staff) {
          return res.status(404).json({ message: "Staff not found." });
        }
        companyId = staff.companyId;
      } else {
        const owner = await ownerModel.findById(id);
        if (!owner) {
          return res.status(404).json({ message: "Owner not found." });
        }
        companyId = owner.companyId;
      }

      if (!companyId) {
        return res.status(400).json({ message: "Company ID not found." });
      }
      // 2. Query reservations that overlap with the given date range
      const reservations = await reservationModel
        .find({
          companyId: companyId,
          status: { $ne: "cancel" }, // Exclude 'cancel' status
          // Reservation overlaps with the range if:
          // (its checkInDate is before the rangeEndDate) AND (its checkOutDate is after or on the rangeStartDate)
          checkInDate: { $lte: finalEndDate }, // Reservation starts before the end of the range
          checkOutDate: { $gte: finalStartDate }, // Reservation ends after or on the start of the range
        })
        .populate({
          path: "roomDetails.roomId", // Populate room details within roomDetails array
        })
        .populate("residentId") // Populate guest details
        .lean(); // Use lean() for faster query results if you don't need Mongoose documents
      // 3. Filter out any reservation where roomDetails.roomId was not matched
      // This can happen if a room was deleted or ID is bad.
      const totalReservations = await reservationModel
        .find({
          companyId: companyId,
          status: { $ne: "cancel" }, // Exclude 'cancel' status
          // Reservation overlaps with the range if:
          // (its checkInDate is before the rangeEndDate) AND (its checkOutDate is after or on the rangeStartDate)
          checkInDate: { $lte: finalEndDate }, // Reservation starts before the end of the range
          checkOutDate: { $gte: finalStartDate }, // Reservation ends after or on the start of the range
        })
        .countDocuments();
      console.log(totalReservations);
      const validReservations = reservations.filter((res) =>
        res.roomDetails?.some((detail) => detail.roomId !== null)
      );

      res.status(200).json({
        message: "Reservations fetched",
        reservations: validReservations,
      });
    } catch (err) {
      console.error("Reservation fetch error:", err);
      res.status(500).json({
        message: "Failed to fetch reservations",
        error: err.message,
      });
    }
  };
}

module.exports = new orderController();
