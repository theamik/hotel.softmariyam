const {
  mongo: { ObjectId },
} = require("mongoose");
const { responseReturn } = require("../../utils/response");
const moment = require("moment");
const staffModel = require("../../models/staffModel");
const draftModel = require("../../models/draftModel");
const partyModel = require("../../models/partyModel");
const orderModel = require("../../models/orderModel");
const transactionModel = require("../../models/transactionModel");
const productModel = require("../../models/productModel");
const collect = require("collect.js");
const ownerModel = require("../../models/ownerModel");
class transactionController {
  payment_transaction = async (req, res) => {
    const { id, role } = req;

    const { date, debit, credit, description, amount, branch } = req.body;

    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var branchId = branch?.toString();
      var { name } = await ownerModel.findById(id);
    }

    const tempDate = moment(date.startDate).format();
    const credit_party = await partyModel.find({
      accountType: credit,
      companyId: companyId,
    });
    const debit_party = await partyModel.findById(debit);
    const UniqueId = Date.now().toString(36).toUpperCase();
    try {
      const transaction = await transactionModel.create({
        companyId: new ObjectId(companyId),
        branchId: branchId,
        transactionNo: UniqueId,
        debit: debit_party,
        credit: credit_party[0],
        generatedBy: name,
        balance: amount,
        transactionType: "Payment",
        description: description ? description : "Payment To Party",
        date: tempDate,
      });
      debit_party.balance = Number(debit_party.balance) + Number(amount);
      await debit_party.save();

      credit_party[0].balance =
        Number(credit_party[0].balance) - Number(amount);
      await credit_party[0].save();

      responseReturn(res, 201, {
        transaction,
        message: "Payment data stored",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  receive_transaction = async (req, res) => {
    const { id, role } = req;

    const { date, debit, credit, description, amount, branch } = req.body;

    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var branchId = branch?.toString();
      var { name } = await ownerModel.findById(id);
    }

    console.log(branchId);
    const tempDate = moment(date.startDate).format();
    const credit_party = await partyModel.findById(credit);
    const debit_party = await partyModel.find({
      accountType: debit,
      companyId: companyId,
    });
    const UniqueId = Date.now().toString(36).toUpperCase();
    try {
      const transaction = await transactionModel.create({
        companyId: new ObjectId(companyId),
        branchId: branchId,
        transactionNo: UniqueId,
        debit: debit_party[0],
        credit: credit_party,
        generatedBy: name,
        balance: amount,
        transactionType: "Received",
        description: description ? description : "Received From Party",
        date: tempDate,
      });

      debit_party[0].balance = Number(debit_party[0].balance) + Number(amount);
      await debit_party[0].save();

      credit_party.balance = Number(credit_party.balance) - Number(amount);
      await credit_party.save();
      responseReturn(res, 201, {
        transaction,
        message: "Received data stored",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  contra_transaction = async (req, res) => {
    const { id, role } = req;

    const { date, debit, credit, description, amount, branch } = req.body;

    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
      var { name } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
      var branchId = branch?.toString();
      var { name } = await ownerModel.findById(id);
    }

    const tempDate = moment(date.startDate).format();
    const credit_party = await partyModel.findById(credit);
    const debit_party = await partyModel.findById(debit);
    const UniqueId = Date.now().toString(36).toUpperCase();
    // console.log(tempDate);
    try {
      const transaction = await transactionModel.create({
        companyId: new ObjectId(companyId),
        branchId: branchId,
        transactionNo: UniqueId,
        debit: debit_party,
        credit: credit_party,
        generatedBy: name,
        balance: amount,
        transactionType: "Contra",
        description: description ? description : "Contra Transaction",
        date: tempDate,
      });

      if (debit !== credit) {
        debit_party.balance = Number(debit_party.balance) + Number(amount);

        await debit_party.save();

        credit_party.balance = Number(credit_party.balance) - Number(amount);

        await credit_party.save();
      }
      responseReturn(res, 201, {
        transaction,
        message: "Contra data stored",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  party_ledger = async (req, res) => {
    const { id, role } = req;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }
    const { date, account } = req.body;
    const startDate = moment(date.startDate)
      .subtract(1, "days")
      .format()
      .toString();
    const endDate = moment(date.endDate).add(1, "days").format().toString();
    const party = await partyModel.findById(account);
    //console.log(account);
    try {
      if (role === "staff") {
        const transactions1 = await transactionModel
          .find({
            date: { $gte: startDate, $lte: endDate },
          })
          .populate("credit");
        const allItems1 = transactions1.map((item) => item.balance);
        const debitBalance = collect(allItems1).sum();
        // const transactions = await transactionModel.find({ debit: debit } && { credit: debit })
        const transactions2 = await transactionModel
          .find({ branchId: branchId, credit: account })
          .where({ date: { $gte: startDate, $lte: endDate } })
          .populate("debit");
        const allItems2 = transactions2.map((item) => item.balance);
        const creditBalance = collect(allItems2).sum();
        const newtra = transactions1.concat(transactions2);
        const transactions = newtra.sort(function (a, b) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(a.date) - new Date(b.date);
        });
        //console.log(transactions1);
        //console.log(creditBalance);
        responseReturn(res, 201, {
          transactions,
          party,
          debitBalance,
          creditBalance,
        });
      } else {
        if (req.body.branchId !== "") {
          const newId = req.body.branchId;
          //console.log(newId);
          const transactions1 = await transactionModel
            .find({ branchId: newId, debit: account })
            .where({ date: { $gte: startDate, $lte: endDate } })
            .populate("credit");
          const allItems1 = transactions1.map((item) => item.balance);
          const debitBalance = collect(allItems1).sum();
          // const transactions = await transactionModel.find({ debit: debit } && { credit: debit })
          const transactions2 = await transactionModel
            .find({ branchId: newId, credit: account })
            .where({ date: { $gte: startDate, $lte: endDate } })
            .populate("debit");
          const allItems2 = transactions2.map((item) => item.balance);
          const creditBalance = collect(allItems2).sum();
          const newtra = transactions1.concat(transactions2);
          const transactions = newtra.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.date) - new Date(b.date);
          });
          //console.log(transactions);
          responseReturn(res, 201, {
            transactions,
            party,
            debitBalance,
            creditBalance,
          });
        } else {
          const transactions1 = await transactionModel
            .find({ companyId: companyId, debit: account })
            .where({ date: { $gte: startDate, $lte: endDate } })
            .populate("credit");
          const allItems1 = transactions1.map((item) => item.balance);
          const debitBalance = collect(allItems1).sum();
          // const transactions = await transactionModel.find({ debit: debit } && { credit: debit })
          const transactions2 = await transactionModel
            .find({ companyId: companyId, credit: account })
            .where({ date: { $gte: startDate, $lte: endDate } })
            .populate("debit");
          const allItems2 = transactions2.map((item) => item.balance);
          const creditBalance = collect(allItems2).sum();
          const newtra = transactions1.concat(transactions2);
          const transactions = newtra.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.date) - new Date(b.date);
          });
          responseReturn(res, 201, {
            transactions,
            party,
            debitBalance,
            creditBalance,
          });
        }
      }
    } catch (error) {}
  };

  income_statement = async (req, res) => {
    const { id, role } = req;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }
    const { date } = req.body;
    const startDate = moment(date.startDate).format();
    const endDate = moment(date.endDate).add(1, "days").format();
    try {
      if (role === "staff") {
        const transactions = await transactionModel
          .find({ branchId: branchId })
          .where({ date: { $gte: startDate, $lte: endDate } });
        //Income Part
        const incomeTransaction = await transactionModel
          .find({ branchId: branchId })
          .where({ date: { $gte: startDate, $lte: endDate } });
        const incomeItems = incomeTransaction.reduce((res, item) => {
          res.push({ credit: item.credit });
          return res;
        }, []);

        let incomeObject = incomeItems.map(JSON.stringify);
        let incomeSet = new Set(incomeObject);
        const incomeArray = Array.from(incomeSet).map(JSON.parse);
        const incomeLast = incomeArray.map((s) => Object.values(s));
        const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
        const incomeParty = await partyModel
          .find({ _id: { $in: incomeResult }, accountType: "Income" })
          .sort({ name: 1 });
        //Expense Part
        const expenseTransaction = await transactionModel
          .find({ branchId: branchId, transactionType: "Payment" })
          .where({ date: { $gte: startDate, $lte: endDate } });
        const expenseItems = expenseTransaction.reduce((res, item) => {
          res.push({ debit: item.debit });
          return res;
        }, []);
        let expenseObject = expenseItems.map(JSON.stringify);
        let expenseSet = new Set(expenseObject);
        const expenseArray = Array.from(expenseSet).map(JSON.parse);
        const expenseLast = expenseArray.map((s) => Object.values(s));
        const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
        const expenseParty = await partyModel
          .find({ _id: { $in: expenseResult }, accountType: "Expense" })
          .sort({ name: 1 });
        //Sales Transaction
        const sales_party = await partyModel.find({
          accountType: "Sales_Account",
        });
        const salesTransactions = await transactionModel
          .find({ branchId: branchId, credit: sales_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalSales = 0;

        for (let i = 0; i < salesTransactions?.length; i++) {
          totalSales += salesTransactions[i]?.balance;
        }
        //Discount
        const discount_party = await partyModel.find({
          accountType: "Discount",
        });
        const discountTransactions = await transactionModel
          .find({ branchId: branchId, debit: discount_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalDiscount = 0;

        for (let i = 0; i < discountTransactions?.length; i++) {
          totalDiscount += discountTransactions[i]?.balance;
        }

        // // Purchase
        // const purchase_party = await partyModel.find({ accountType: "Purchase_Account" })
        // const purchaseTransactions = await transactionModel.find({ companyId: companyId, debit: purchase_party }).where({ "date": { "$gte": startDate, "$lte": endDate } });

        // let totalPurchase = 0;

        // for (let i = 0; i < purchaseTransactions?.length; i++) {
        //     totalPurchase += purchaseTransactions[i]?.balance
        // }

        const SoldOrders = await orderModel
          .find({ companyId: companyId })
          .where({ date: { $gte: startDate, $lte: endDate } });

        const totalCartItems = SoldOrders.reduce((res, item) => {
          res.push(item.cartItems);
          return res;
        }, []);
        const merge3 = totalCartItems.flat(1);

        const products = await productModel.find({ companyId: companyId });

        let totalProductsValue = 0;

        for (let i = 0; i < products?.length; i++) {
          for (let j = 0; j < merge3.length; j++) {
            if (products[i]?._id == merge3[j]?.id) {
              totalProductsValue +=
                products[i]?.purchase_price * merge3[j]?.quantity;
            }
          }
        }

        const totalPurchase = totalProductsValue;
        //Expense Calculate

        let ExpensePart = [];

        for (let i = 0; i < expenseParty.length; i++) {
          const exp1 = await transactionModel
            .find({ debit: expenseParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems1 = exp1.map((item) => item.balance);
          const exp2 = await transactionModel
            .find({ credit: expenseParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems2 = exp2.map((item) => item.balance);
          const amount1 = collect(allItems1).sum();
          const amount2 = collect(allItems2).sum();
          const amount = amount1 - amount2;
          ExpensePart.push({ name: expenseParty[i].name, amount: amount });
        }
        const totalExpense = collect(
          ExpensePart.map((item) => item.amount)
        ).sum();
        //Income Calculate

        let IncomePart = [];

        for (let i = 0; i < incomeParty.length; i++) {
          const inc1 = await transactionModel
            .find({ credit: incomeParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems1 = inc1.map((item) => item.balance);
          const inc2 = await transactionModel
            .find({ debit: incomeParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems2 = inc2.map((item) => item.balance);
          const amount1 = collect(allItems1).sum();
          const amount2 = collect(allItems2).sum();
          const amount = amount1 - amount2;
          IncomePart.push({ name: incomeParty[i].name, amount: amount });
        }
        const totalIncome = collect(
          IncomePart.map((item) => item.amount)
        ).sum();

        responseReturn(res, 201, {
          startDate,
          endDate,
          transactions,
          incomeParty,
          expenseParty,
          totalSales,
          totalDiscount,
          totalPurchase,
          ExpensePart,
          IncomePart,
          totalExpense,
          totalIncome,
        });
      } else {
        if (req.body.branchId !== "") {
          const newId = req.body.branchId;
          const transactions = await transactionModel
            .find({ branchId: newId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          //Income Part
          const incomeTransaction = await transactionModel
            .find({ branchId: newId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const incomeItems = incomeTransaction.reduce((res, item) => {
            res.push({ credit: item.credit });
            return res;
          }, []);

          let incomeObject = incomeItems.map(JSON.stringify);
          let incomeSet = new Set(incomeObject);
          const incomeArray = Array.from(incomeSet).map(JSON.parse);
          const incomeLast = incomeArray.map((s) => Object.values(s));
          const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
          const incomeParty = await partyModel
            .find({
              _id: { $in: incomeResult },
              accountType: "Income",
              companyId: companyId,
            })
            .sort({ name: 1 });
          //Expense Part
          const expenseTransaction = await transactionModel
            .find({
              branchId: newId,
              transactionType: "Payment",
              companyId: companyId,
            })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const expenseItems = expenseTransaction.reduce((res, item) => {
            res.push({ debit: item.debit });
            return res;
          }, []);
          let expenseObject = expenseItems.map(JSON.stringify);
          let expenseSet = new Set(expenseObject);
          const expenseArray = Array.from(expenseSet).map(JSON.parse);
          const expenseLast = expenseArray.map((s) => Object.values(s));
          const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
          const expenseParty = await partyModel
            .find({
              _id: { $in: expenseResult },
              accountType: "Expense",
              companyId: companyId,
            })
            .sort({ name: 1 });
          //Sales Transaction
          const sales_party = await partyModel.find({
            accountType: "Sales_Account",
            companyId: companyId,
          });
          const salesTransactions = await transactionModel
            .find({ branchId: newId, credit: sales_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalSales = 0;

          for (let i = 0; i < salesTransactions?.length; i++) {
            totalSales += salesTransactions[i]?.balance;
          }
          //Discount
          const discount_party = await partyModel.find({
            accountType: "Discount",
            companyId: companyId,
          });
          const discountTransactions = await transactionModel
            .find({ branchId: newId, debit: discount_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalDiscount = 0;

          for (let i = 0; i < discountTransactions?.length; i++) {
            totalDiscount += discountTransactions[i]?.balance;
          }

          // // Purchase
          // const purchase_party = await partyModel.find({ accountType: "Purchase_Account" })
          // const purchaseTransactions = await transactionModel.find({ companyId: companyId, debit: purchase_party }).where({ "date": { "$gte": startDate, "$lte": endDate } });

          // let totalPurchase = 0;

          // for (let i = 0; i < purchaseTransactions?.length; i++) {
          //     totalPurchase += purchaseTransactions[i]?.balance
          // }
          const SoldOrders = await orderModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });

          const totalCartItems = SoldOrders.reduce((res, item) => {
            res.push(item.cartItems);
            return res;
          }, []);
          const merge3 = totalCartItems.flat(1);

          const products = await productModel.find({ companyId: companyId });

          let totalProductsValue = 0;

          for (let i = 0; i < products?.length; i++) {
            for (let j = 0; j < merge3.length; j++) {
              if (products[i]?._id == merge3[j]?.id) {
                totalProductsValue +=
                  products[i]?.purchase_price * merge3[j]?.quantity;
              }
            }
          }

          const totalPurchase = totalProductsValue;
          //Expense Calculate

          let ExpensePart = [];

          for (let i = 0; i < expenseParty.length; i++) {
            const exp1 = await transactionModel
              .find({ debit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = exp1.map((item) => item.balance);
            const exp2 = await transactionModel
              .find({ credit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = exp2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            ExpensePart.push({ name: expenseParty[i].name, amount: amount });
          }
          const totalExpense = collect(
            ExpensePart.map((item) => item.amount)
          ).sum();
          //Income Calculate

          let IncomePart = [];

          for (let i = 0; i < incomeParty.length; i++) {
            const inc1 = await transactionModel
              .find({ credit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = inc1.map((item) => item.balance);
            const inc2 = await transactionModel
              .find({ debit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = inc2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            IncomePart.push({ name: incomeParty[i].name, amount: amount });
          }
          const totalIncome = collect(
            IncomePart.map((item) => item.amount)
          ).sum();

          responseReturn(res, 201, {
            startDate,
            endDate,
            transactions,
            incomeParty,
            expenseParty,
            totalSales,
            totalDiscount,
            totalPurchase,
            ExpensePart,
            IncomePart,
            totalExpense,
            totalIncome,
          });
        } else {
          const transactions = await transactionModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          //Income Part
          const incomeTransaction = await transactionModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const incomeItems = incomeTransaction.reduce((res, item) => {
            res.push({ credit: item.credit });
            return res;
          }, []);

          let incomeObject = incomeItems.map(JSON.stringify);
          let incomeSet = new Set(incomeObject);
          const incomeArray = Array.from(incomeSet).map(JSON.parse);
          const incomeLast = incomeArray.map((s) => Object.values(s));
          const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
          const incomeParty = await partyModel
            .find({
              _id: { $in: incomeResult },
              accountType: "Income",
              companyId: companyId,
            })
            .sort({ name: 1 });
          //Expense Part
          const expenseTransaction = await transactionModel
            .find({
              companyId: companyId,
            })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const expenseItems = expenseTransaction.reduce((res, item) => {
            res.push({ debit: item.debit });
            return res;
          }, []);
          let expenseObject = expenseItems.map(JSON.stringify);
          let expenseSet = new Set(expenseObject);
          const expenseArray = Array.from(expenseSet).map(JSON.parse);
          const expenseLast = expenseArray.map((s) => Object.values(s));
          const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
          const expenseParty = await partyModel
            .find({
              _id: { $in: expenseResult },
              accountType: "Expense",
              companyId: companyId,
            })
            .sort({ name: 1 });
          //Sales Transaction
          const sales_party = await partyModel.find({
            accountType: "Sales_Account",
            companyId: companyId,
          });
          const salesTransactions = await transactionModel
            .find({ companyId: companyId, credit: sales_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalSales = 0;

          for (let i = 0; i < salesTransactions?.length; i++) {
            totalSales += salesTransactions[i]?.balance;
          }
          //Discount
          const discount_party = await partyModel.find({
            accountType: "Discount",
            companyId: companyId,
          });
          const discountTransactions = await transactionModel
            .find({ companyId: companyId, debit: discount_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalDiscount = 0;

          for (let i = 0; i < discountTransactions?.length; i++) {
            totalDiscount += discountTransactions[i]?.balance;
          }

          // // Purchase
          // const purchase_party = await partyModel.find({ accountType: "Purchase_Account" })
          // const purchaseTransactions = await transactionModel.find({ companyId: companyId, debit: purchase_party }).where({ "date": { "$gte": startDate, "$lte": endDate } });

          // let totalPurchase = 0;

          // for (let i = 0; i < purchaseTransactions?.length; i++) {
          //     totalPurchase += purchaseTransactions[i]?.balance
          // }
          const SoldOrders = await orderModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });

          const totalCartItems = SoldOrders.reduce((res, item) => {
            res.push(item.cartItems);
            return res;
          }, []);
          const merge3 = totalCartItems.flat(1);

          const products = await productModel.find({ companyId: companyId });

          let totalProductsValue = 0;

          for (let i = 0; i < products?.length; i++) {
            for (let j = 0; j < merge3.length; j++) {
              if (products[i]?._id == merge3[j]?.id) {
                totalProductsValue +=
                  products[i]?.purchase_price * merge3[j]?.quantity;
              }
            }
          }

          const totalPurchase = totalProductsValue;

          //const totalPurchase = 0;
          //Expense Calculate

          let ExpensePart = [];

          for (let i = 0; i < expenseParty.length; i++) {
            const exp1 = await transactionModel
              .find({ debit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = exp1.map((item) => item.balance);
            const exp2 = await transactionModel
              .find({ credit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = exp2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            ExpensePart.push({ name: expenseParty[i].name, amount: amount });
          }
          const totalExpense = collect(
            ExpensePart.map((item) => item.amount)
          ).sum();
          //Income Calculate

          let IncomePart = [];

          for (let i = 0; i < incomeParty.length; i++) {
            const inc1 = await transactionModel
              .find({ credit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = inc1.map((item) => item.balance);
            const inc2 = await transactionModel
              .find({ debit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = inc2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            IncomePart.push({ name: incomeParty[i].name, amount: amount });
          }
          const totalIncome = collect(
            IncomePart.map((item) => item.amount)
          ).sum();

          responseReturn(res, 201, {
            startDate,
            endDate,
            transactions,
            incomeParty,
            expenseParty,
            totalSales,
            totalDiscount,
            totalPurchase,
            ExpensePart,
            IncomePart,
            totalExpense,
            totalIncome,
          });
        }
      }
    } catch (error) {}
  };

  balance_sheet = async (req, res) => {
    const { id, role } = req;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }
    const { date } = req.body;
    const startDate = moment(date.startDate).format();
    const endDate = moment(date.endDate).add(1, "days").format();
    try {
      if (role === "staff") {
        const cash_party = await partyModel.find({
          accountType: "Cash",
          companyId: companyId,
        });
        const cashAccount = cash_party;
        // for (let i = 0; i < cash_party.length; i++) {
        //   const cash1 = await transactionModel
        //     .find({ branchId: branchId, debit: cash_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = cash1.map((item) => item.balance);
        //   const cash2 = await transactionModel
        //     .find({ branchId: branchId, credit: cash_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = cash2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const cash = amount1 - amount2;
        //   cashAccount.push({ name: cash_party[i].name, amount: cash });
        // }

        const mobile_party = await partyModel.find({
          accountType: "Mobile_Banking",
          companyId: companyId,
        });
        const mobileAccount = mobile_party;
        // for (let i = 0; i < mobile_party.length; i++) {
        //   const mobile1 = await transactionModel
        //     .find({ branchId: branchId, debit: mobile_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = mobile1.map((item) => item.balance);
        //   const mobile2 = await transactionModel
        //     .find({ branchId: branchId, credit: mobile_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = mobile2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const mobile = amount1 - amount2;
        //   mobileAccount.push({ name: mobile_party[i].name, amount: mobile });
        // }

        const card_party = await partyModel.find({
          accountType: "Card",
          companyId: companyId,
        });
        const cardAccount = card_party;
        // for (let i = 0; i < card_party.length; i++) {
        //   const card1 = await transactionModel
        //     .find({ branchId: branchId, debit: card_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = card1.map((item) => item.balance);
        //   const card2 = await transactionModel
        //     .find({ branchId: branchId, credit: card_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = card2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const card = amount1 - amount2;
        //   cardAccount.push({ name: card_party[i].name, amount: card });
        // }

        const Account_Payable_party = await partyModel.find({
          accountType: "Account_Payable",
          companyId: companyId,
        });
        const Account_PayableAccount = Account_Payable_party;
        // for (let i = 0; i < Account_Payable_party.length; i++) {
        //   const Account_Payable1 = await transactionModel
        //     .find({ companyId: companyId, debit: Account_Payable_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Account_Payable1.map((item) => item.balance);
        //   const Account_Payable2 = await transactionModel
        //     .find({ companyId: companyId, credit: Account_Payable_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Account_Payable2.map((item) => item.balance);
        //   const amount2 = collect(allItems1).sum();
        //   const amount1 = collect(allItems2).sum();
        //   const Account_Payable = amount1 - amount2;
        //   Account_PayableAccount.push({
        //     name: Account_Payable_party[i].name,
        //     amount: Account_Payable,
        //   });
        // }

        const Account_Receivable_party = await partyModel.find({
          accountType: "Account_Receivable",
          companyId: companyId,
        });
        const Account_ReceivableAccount = Account_Receivable_party;
        // for (let i = 0; i < Account_Receivable_party.length; i++) {
        //   const Account_Receivable1 = await transactionModel
        //     .find({ branchId: branchId, debit: Account_Receivable_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Account_Receivable1.map((item) => item.balance);
        //   const Account_Receivable2 = await transactionModel
        //     .find({ branchId: branchId, credit: Account_Receivable_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Account_Receivable2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const Account_Receivable = amount1 - amount2;
        //   Account_ReceivableAccount.push({
        //     name: Account_Receivable_party[i].name,
        //     amount: Account_Receivable,
        //   });
        // }
        // Purchase
        const purchase_party = await partyModel.find({
          accountType: "Purchase_Account",
        });
        const purchaseTransactions = await transactionModel
          .find({ companyId: companyId, debit: purchase_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalPurchase = 0;

        for (let i = 0; i < purchaseTransactions?.length; i++) {
          totalPurchase += purchaseTransactions[i]?.balance;
        }

        // Purchase
        const Inventory_party = await partyModel.find({
          accountType: "Inventory",
        });
        const InventoryTransactions = await transactionModel
          .find({ companyId: companyId, debit: Inventory_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalInventory = 0;

        for (let i = 0; i < InventoryTransactions?.length; i++) {
          totalInventory += InventoryTransactions[i]?.balance;
        }
        // let present_Inventory = totalPurchase - totalInventory;
        let present_Inventory = 0;

        //Finish Goods

        const products = await productModel.find({ companyId: companyId });

        let ProductsValue = 0;

        for (let i = 0; i < products?.length; i++) {
          ProductsValue += products[i]?.purchase_price * products[i]?.stock;
        }

        const totalProductsValue = ProductsValue;
        const Loan_Given_party = await partyModel.find({
          accountType: "Loan_Given",
          companyId: companyId,
        });
        const Loan_GivenAccount = Loan_Given_party;
        // for (let i = 0; i < Loan_Given_party.length; i++) {
        //   const Loan_Given1 = await transactionModel
        //     .find({ branchId: branchId, debit: Loan_Given_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Loan_Given1.map((item) => item.balance);
        //   const Loan_Given2 = await transactionModel
        //     .find({ branchId: branchId, credit: Loan_Given_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Loan_Given2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const Loan_Given = amount1 - amount2;
        //   Loan_GivenAccount.push({
        //     name: Loan_Given_party[i].name,
        //     amount: Loan_Given,
        //   });
        // }

        const Loan_Taken_party = await partyModel.find({
          accountType: "Loan_Taken",
          companyId: companyId,
        });
        const Loan_TakenAccount = Loan_Taken_party;
        // for (let i = 0; i < Loan_Taken_party.length; i++) {
        //   const Loan_Taken1 = await transactionModel
        //     .find({ branchId: branchId, debit: Loan_Taken_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Loan_Taken1.map((item) => item.balance);
        //   const Loan_Taken2 = await transactionModel
        //     .find({ branchId: branchId, credit: Loan_Taken_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Loan_Taken2.map((item) => item.balance);
        //   const amount2 = collect(allItems1).sum();
        //   const amount1 = collect(allItems2).sum();
        //   const Loan_Taken = amount1 - amount2;
        //   Loan_TakenAccount.push({
        //     name: Loan_Taken_party[i].name,
        //     amount: Loan_Taken,
        //   });
        // }

        const Asset_party = await partyModel.find({
          accountType: "Asset",
          companyId: companyId,
        });
        const AssetAccount = Asset_party;
        // for (let i = 0; i < Asset_party.length; i++) {
        //   const Asset1 = await transactionModel
        //     .find({ branchId: branchId, debit: Asset_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Asset1.map((item) => item.balance);
        //   const Asset2 = await transactionModel
        //     .find({ branchId: branchId, credit: Asset_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Asset2.map((item) => item.balance);
        //   const amount1 = collect(allItems1).sum();
        //   const amount2 = collect(allItems2).sum();
        //   const Asset = amount1 - amount2;
        //   AssetAccount.push({ name: Asset_party[i].name, amount: Asset });
        // }

        const Liability_party = await partyModel.find({
          accountType: "Liability",
          companyId: companyId,
        });
        // const LiabilityAccount = [];
        // for (let i = 0; i < Liability_party.length; i++) {
        //   const Liability1 = await transactionModel
        //     .find({ branchId: branchId, debit: Liability_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Liability1.map((item) => item.balance);
        //   const Liability2 = await transactionModel
        //     .find({ branchId: branchId, credit: Liability_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Liability2.map((item) => item.balance);
        //   const amount2 = collect(allItems1).sum();
        //   const amount1 = collect(allItems2).sum();
        //   const Liability = amount1 - amount2;
        //   LiabilityAccount.push({
        //     name: Liability_party[i].name,
        //     amount: Liability,
        //   });
        // }
        let LiabilityAccount = Liability_party;
        const Equity_party = await partyModel.find({
          accountType: "Equity",
          companyId: companyId,
        });
        const EquityAccount = Equity_party;
        // for (let i = 0; i < Equity_party.length; i++) {
        //   const Equity1 = await transactionModel
        //     .find({ branchId: branchId, debit: Equity_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems1 = Equity1.map((item) => item.balance);
        //   const Equity2 = await transactionModel
        //     .find({ branchId: branchId, credit: Equity_party[i] })
        //     .where({ date: { $gte: startDate, $lte: endDate } });
        //   const allItems2 = Equity2.map((item) => item.balance);
        //   const amount2 = collect(allItems1).sum();
        //   const amount1 = collect(allItems2).sum();
        //   const Equity = amount1 - amount2;
        //   EquityAccount.push({ name: Equity_party[i].name, amount: Equity });
        // }

        // Total Current Asset
        const cashItem = cashAccount.map((item) => item.balance);
        const totalCash = collect(cashItem).sum();

        const mobileItem = mobileAccount.map((item) => item.balance);
        const totalMobile = collect(mobileItem).sum();

        const cardItem = cardAccount.map((item) => item.balance);
        const totalCard = collect(cardItem).sum();

        const acItem = Account_ReceivableAccount.map((item) => item.balance);
        const totalAc = collect(acItem).sum();

        const Loan_Given = Loan_GivenAccount.map((item) => item.balance);
        const totalLoan_Given = collect(Loan_Given).sum();

        const totalCurrentAsset =
          totalCash +
          totalMobile +
          totalCard +
          totalAc +
          present_Inventory +
          totalLoan_Given +
          totalProductsValue;
        // Total Fixed Asset

        const Fixed_Asset = AssetAccount.map((item) => item.balance);
        const totalFixedAsset = collect(Fixed_Asset).sum();

        // Total Current Liability

        const Account_Pay = Account_PayableAccount.map((item) => item.balance);
        const totalAccount_Pay = -1 * collect(Account_Pay).sum();

        const Loan_Taken = Loan_TakenAccount.map((item) => item.balance);
        const totalLoan_Taken = -1 * collect(Loan_Taken).sum();

        const totalCurrentLiability = totalAccount_Pay + totalLoan_Taken;

        // Long Term Liability
        const Liability_Long = LiabilityAccount.map((item) => item.balance);
        const totalLiability_Long = collect(Liability_Long).sum();

        ///// ----------------------- Net Profit ------------------------ ///
        const transactions = await transactionModel
          .find({ branchId: branchId })
          .where({ date: { $gte: startDate, $lte: endDate } });
        //Income Part
        const incomeTransaction = await transactionModel
          .find({ branchId: branchId })
          .where({ date: { $gte: startDate, $lte: endDate } });
        const incomeItems = incomeTransaction.reduce((res, item) => {
          res.push({ credit: item.credit });
          return res;
        }, []);

        let incomeObject = incomeItems.map(JSON.stringify);
        let incomeSet = new Set(incomeObject);
        const incomeArray = Array.from(incomeSet).map(JSON.parse);
        const incomeLast = incomeArray.map((s) => Object.values(s));
        const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
        const incomeParty = await partyModel
          .find({ _id: { $in: incomeResult }, accountType: "Income" })
          .sort({ name: 1 });
        //Expense Part
        const expenseTransaction = await transactionModel
          .find({ branchId: branchId })
          .where({ date: { $gte: startDate, $lte: endDate } });
        const expenseItems = expenseTransaction.reduce((res, item) => {
          res.push({ debit: item.debit });
          return res;
        }, []);
        let expenseObject = expenseItems.map(JSON.stringify);
        let expenseSet = new Set(expenseObject);
        const expenseArray = Array.from(expenseSet).map(JSON.parse);
        const expenseLast = expenseArray.map((s) => Object.values(s));
        const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
        const expenseParty = await partyModel
          .find({ _id: { $in: expenseResult }, accountType: "Expense" })
          .sort({ name: 1 });
        //Sales Transaction
        const sales_party = await partyModel.find({
          accountType: "Sales_Account",
        });
        const salesTransactions = await transactionModel
          .find({ branchId: branchId, credit: sales_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalSales = 0;

        for (let i = 0; i < salesTransactions?.length; i++) {
          totalSales += salesTransactions[i]?.balance;
        }
        //Discount
        const discount_party = await partyModel.find({
          accountType: "Discount",
        });
        const discountTransactions = await transactionModel
          .find({ branchId: branchId, debit: discount_party })
          .where({ date: { $gte: startDate, $lte: endDate } });

        let totalDiscount = 0;

        for (let i = 0; i < discountTransactions?.length; i++) {
          totalDiscount += discountTransactions[i]?.balance;
        }

        //Expense Calculate

        let ExpensePart = [];

        for (let i = 0; i < expenseParty.length; i++) {
          const exp1 = await transactionModel
            .find({ debit: expenseParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems1 = exp1.map((item) => item.balance);
          const exp2 = await transactionModel
            .find({ credit: expenseParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems2 = exp2.map((item) => item.balance);
          const amount1 = collect(allItems1).sum();
          const amount2 = collect(allItems2).sum();
          const amount = amount1 - amount2;
          ExpensePart.push({ name: expenseParty[i].name, amount: amount });
        }
        const totalExpense = collect(
          ExpensePart.map((item) => item.amount)
        ).sum();
        //Income Calculate

        let IncomePart = [];

        for (let i = 0; i < incomeParty.length; i++) {
          const inc1 = await transactionModel
            .find({ credit: incomeParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems1 = inc1.map((item) => item.balance);
          const inc2 = await transactionModel
            .find({ debit: incomeParty[i] })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const allItems2 = inc2.map((item) => item.balance);
          const amount1 = collect(allItems1).sum();
          const amount2 = collect(allItems2).sum();
          const amount = amount1 - amount2;
          IncomePart.push({ name: incomeParty[i].name, amount: amount });
        }
        const totalIncome = collect(
          IncomePart.map((item) => item.amount)
        ).sum();

        /////// Net Profit ----------------///
        const SoldOrders = await orderModel
          .find({ companyId: companyId })
          .where({ date: { $gte: startDate, $lte: endDate } });

        const totalCartItems = SoldOrders.reduce((res, item) => {
          res.push(item.cartItems);
          return res;
        }, []);
        const merge3 = totalCartItems.flat(1);
        const stockProducts = await productModel.find({ companyId: companyId });
        let totalPurchaseValue = 0;

        for (let i = 0; i < stockProducts?.length; i++) {
          for (let j = 0; j < merge3.length; j++) {
            if (stockProducts[i]._id == merge3[j].id) {
              totalPurchaseValue +=
                stockProducts[i]?.purchase_price * merge3[j]?.quantity;
            }
          }
        }

        const COGS = totalPurchaseValue;
        const netProfit =
          totalSales + totalIncome - COGS - totalExpense - totalDiscount;

        // Equity
        const Equity = EquityAccount.map((item) => item.balance);
        const totalEquity = collect(Equity).sum();

        const actualEquity = -1 * (totalEquity - netProfit);

        responseReturn(res, 201, {
          startDate,
          endDate,
          cashAccount,
          mobileAccount,
          cardAccount,
          Account_PayableAccount,
          Account_ReceivableAccount,
          present_Inventory,
          totalProductsValue,
          Loan_GivenAccount,
          Loan_TakenAccount,
          AssetAccount,
          LiabilityAccount,
          EquityAccount,
          totalCurrentAsset,
          totalFixedAsset,
          totalCurrentLiability,
          totalLiability_Long,
          actualEquity,
          netProfit,
        });
      } else {
        if (req.body.branchId !== "") {
          const newId = req.body.branchId;
          const cash_party = await partyModel.find({
            accountType: "Cash",
            companyId: companyId,
          });
          const cashAccount = cash_party;
          // for (let i = 0; i < cash_party.length; i++) {
          //   const cash1 = await transactionModel
          //     .find({ branchId: newId, debit: cash_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = cash1.map((item) => item.balance);
          //   const cash2 = await transactionModel
          //     .find({ branchId: newId, credit: cash_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = cash2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const cash = amount1 - amount2;
          //   cashAccount.push({ name: cash_party[i].name, amount: cash });
          // }

          const mobile_party = await partyModel.find({
            accountType: "Mobile_Banking",
            companyId: companyId,
          });
          const mobileAccount = mobile_party;
          // for (let i = 0; i < mobile_party.length; i++) {
          //   const mobile1 = await transactionModel
          //     .find({ branchId: newId, debit: mobile_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = mobile1.map((item) => item.balance);
          //   const mobile2 = await transactionModel
          //     .find({ branchId: newId, credit: mobile_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = mobile2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const mobile = amount1 - amount2;
          //   mobileAccount.push({ name: mobile_party[i].name, amount: mobile });
          // }

          const card_party = await partyModel.find({
            accountType: "Card",
            companyId: companyId,
          });
          const cardAccount = card_party;
          // for (let i = 0; i < card_party.length; i++) {
          //   const card1 = await transactionModel
          //     .find({ branchId: newId, debit: card_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = card1.map((item) => item.balance);
          //   const card2 = await transactionModel
          //     .find({ branchId: newId, credit: card_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = card2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const card = amount1 - amount2;
          //   cardAccount.push({ name: card_party[i].name, amount: card });
          // }

          const Account_Payable_party = await partyModel.find({
            accountType: "Account_Payable",
            companyId: companyId,
          });
          const Account_PayableAccount = Account_Payable_party;
          // for (let i = 0; i < Account_Payable_party.length; i++) {
          //   const Account_Payable1 = await transactionModel
          //     .find({ companyId: companyId, debit: Account_Payable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Account_Payable1.map((item) => item.balance);
          //   const Account_Payable2 = await transactionModel
          //     .find({ companyId: companyId, credit: Account_Payable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Account_Payable2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Account_Payable = amount1 - amount2;
          //   Account_PayableAccount.push({
          //     name: Account_Payable_party[i].name,
          //     amount: Account_Payable,
          //   });
          // }

          const Account_Receivable_party = await partyModel.find({
            accountType: "Account_Receivable",
            companyId: companyId,
          });
          const Account_ReceivableAccount = Account_Receivable_party;
          // for (let i = 0; i < Account_Receivable_party.length; i++) {
          //   const Account_Receivable1 = await transactionModel
          //     .find({ branchId: newId, debit: Account_Receivable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Account_Receivable1.map((item) => item.balance);
          //   const Account_Receivable2 = await transactionModel
          //     .find({ branchId: newId, credit: Account_Receivable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Account_Receivable2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Account_Receivable = amount1 - amount2;
          //   Account_ReceivableAccount.push({
          //     name: Account_Receivable_party[i].name,
          //     amount: Account_Receivable,
          //   });
          // }
          // Purchase
          const purchase_party = await partyModel.find({
            accountType: "Purchase_Account",
          });
          const purchaseTransactions = await transactionModel
            .find({ companyId: companyId, debit: purchase_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalPurchase = 0;

          for (let i = 0; i < purchaseTransactions?.length; i++) {
            totalPurchase += purchaseTransactions[i]?.balance;
          }

          // Purchase
          const Inventory_party = await partyModel.find({
            accountType: "Inventory",
          });
          const InventoryTransactions = await transactionModel
            .find({ companyId: companyId, debit: Inventory_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalInventory = 0;

          for (let i = 0; i < InventoryTransactions?.length; i++) {
            totalInventory += InventoryTransactions[i]?.balance;
          }
          // let present_Inventory = totalPurchase - totalInventory;
          let present_Inventory = 0;

          //Finish Goods

          const products = await productModel.find({ companyId: companyId });
          let ProductsValue = 0;

          for (let i = 0; i < products?.length; i++) {
            ProductsValue += products[i]?.purchase_price * products[i]?.stock;
          }

          const totalProductsValue = ProductsValue;

          const Loan_Given_party = await partyModel.find({
            accountType: "Loan_Given",
            companyId: companyId,
          });
          const Loan_GivenAccount = Loan_Given_party;
          // for (let i = 0; i < Loan_Given_party.length; i++) {
          //   const Loan_Given1 = await transactionModel
          //     .find({ branchId: newId, debit: Loan_Given_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Loan_Given1.map((item) => item.balance);
          //   const Loan_Given2 = await transactionModel
          //     .find({ branchId: newId, credit: Loan_Given_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Loan_Given2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Loan_Given = amount1 - amount2;
          //   Loan_GivenAccount.push({
          //     name: Loan_Given_party[i].name,
          //     amount: Loan_Given,
          //   });
          // }

          const Loan_Taken_party = await partyModel.find({
            accountType: "Loan_Taken",
            companyId: companyId,
          });
          const Loan_TakenAccount = Loan_Taken_party;
          // for (let i = 0; i < Loan_Taken_party.length; i++) {
          //   const Loan_Taken1 = await transactionModel
          //     .find({ branchId: newId, debit: Loan_Taken_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Loan_Taken1.map((item) => item.balance);
          //   const Loan_Taken2 = await transactionModel
          //     .find({ branchId: newId, credit: Loan_Taken_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Loan_Taken2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Loan_Taken = amount1 - amount2;
          //   Loan_TakenAccount.push({
          //     name: Loan_Taken_party[i].name,
          //     amount: Loan_Taken,
          //   });
          // }

          const Asset_party = await partyModel.find({
            accountType: "Asset",
            companyId: companyId,
          });
          const AssetAccount = Asset_party;
          // for (let i = 0; i < Asset_party.length; i++) {
          //   const Asset1 = await transactionModel
          //     .find({ branchId: newId, debit: Asset_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Asset1.map((item) => item.balance);
          //   const Asset2 = await transactionModel
          //     .find({ branchId: newId, credit: Asset_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Asset2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Asset = amount1 - amount2;
          //   AssetAccount.push({ name: Asset_party[i].name, amount: Asset });
          // }

          const Liability_party = await partyModel.find({
            accountType: "Liability",
            companyId: companyId,
          });
          // const LiabilityAccount = [];
          // for (let i = 0; i < Liability_party.length; i++) {
          //   const Liability1 = await transactionModel
          //     .find({ branchId: newId, debit: Liability_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Liability1.map((item) => item.balance);
          //   const Liability2 = await transactionModel
          //     .find({ branchId: newId, credit: Liability_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Liability2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Liability = amount1 - amount2;
          //   LiabilityAccount.push({
          //     name: Liability_party[i].name,
          //     amount: Liability,
          //   });
          // }
          let LiabilityAccount = Liability_party;
          const Equity_party = await partyModel.find({
            accountType: "Equity",
            companyId: companyId,
          });
          //console.log(Equity_party);

          //  const EquityAccount = Equity_party;
          // for (let i = 0; i < Equity_party.length; i++) {
          //   const Equity1 = await transactionModel
          //     .find({ branchId: newId, debit: Equity_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Equity1.map((item) => item.balance);
          //   const Equity2 = await transactionModel
          //     .find({ branchId: newId, credit: Equity_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Equity2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Equity = amount1 - amount2;
          //   EquityAccount.push({ name: Equity_party[i].name, amount: Equity });
          // }

          let EquityAccount = Equity_party;

          // Total Current Asset
          const cashItem = cashAccount.map((item) => item.balance);
          const totalCash = collect(cashItem).sum();

          const mobileItem = mobileAccount.map((item) => item.balance);
          const totalMobile = collect(mobileItem).sum();

          const cardItem = cardAccount.map((item) => item.balance);
          const totalCard = collect(cardItem).sum();

          const acItem = Account_ReceivableAccount.map((item) => item.balance);
          const totalAc = collect(acItem).sum();

          const Loan_Given = Loan_GivenAccount.map((item) => item.balance);
          const totalLoan_Given = collect(Loan_Given).sum();

          const totalCurrentAsset =
            totalCash +
            totalMobile +
            totalCard +
            totalAc +
            present_Inventory +
            totalLoan_Given +
            totalProductsValue;
          // Total Fixed Asset

          const Fixed_Asset = AssetAccount.map((item) => item.balance);
          const totalFixedAsset = collect(Fixed_Asset).sum();

          // Total Current Liability

          const Account_Pay = Account_PayableAccount.map(
            (item) => item.balance
          );
          const totalAccount_Pay = -1 * collect(Account_Pay).sum();

          const Loan_Taken = Loan_TakenAccount.map((item) => item.balance);
          const totalLoan_Taken = -1 * collect(Loan_Taken).sum();

          const totalCurrentLiability = totalAccount_Pay + totalLoan_Taken;

          // Long Term Liability
          const Liability_Long = LiabilityAccount.map((item) => item.balance);
          const totalLiability_Long = collect(Liability_Long).sum();

          ///// ----------------------- Net Profit ------------------------ ///

          //Income Part
          const incomeTransaction = await transactionModel
            .find({ branchId: newId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const incomeItems = incomeTransaction.reduce((res, item) => {
            res.push({ credit: item.credit });
            return res;
          }, []);

          let incomeObject = incomeItems.map(JSON.stringify);
          let incomeSet = new Set(incomeObject);
          const incomeArray = Array.from(incomeSet).map(JSON.parse);
          const incomeLast = incomeArray.map((s) => Object.values(s));
          const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
          const incomeParty = await partyModel
            .find({ _id: { $in: incomeResult }, accountType: "Income" })
            .sort({ name: 1 });
          //Expense Part
          const expenseTransaction = await transactionModel
            .find({ branchId: newId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const expenseItems = expenseTransaction.reduce((res, item) => {
            res.push({ debit: item.debit });
            return res;
          }, []);
          let expenseObject = expenseItems.map(JSON.stringify);
          let expenseSet = new Set(expenseObject);
          const expenseArray = Array.from(expenseSet).map(JSON.parse);
          const expenseLast = expenseArray.map((s) => Object.values(s));
          const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
          const expenseParty = await partyModel
            .find({ _id: { $in: expenseResult }, accountType: "Expense" })
            .sort({ name: 1 });
          //Sales Transaction
          const sales_party = await partyModel.find({
            accountType: "Sales_Account",
          });
          const salesTransactions = await transactionModel
            .find({ branchId: newId, credit: sales_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalSales = 0;

          for (let i = 0; i < salesTransactions?.length; i++) {
            totalSales += salesTransactions[i]?.balance;
          }
          //Discount
          const discount_party = await partyModel.find({
            accountType: "Discount",
          });
          const discountTransactions = await transactionModel
            .find({ branchId: newId, debit: discount_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalDiscount = 0;

          for (let i = 0; i < discountTransactions?.length; i++) {
            totalDiscount += discountTransactions[i]?.balance;
          }

          //Expense Calculate

          let ExpensePart = [];

          for (let i = 0; i < expenseParty.length; i++) {
            const exp1 = await transactionModel
              .find({ debit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = exp1.map((item) => item.balance);
            const exp2 = await transactionModel
              .find({ credit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = exp2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            ExpensePart.push({ name: expenseParty[i].name, amount: amount });
          }
          const totalExpense = collect(
            ExpensePart.map((item) => item.amount)
          ).sum();
          //Income Calculate

          let IncomePart = [];

          for (let i = 0; i < incomeParty.length; i++) {
            const inc1 = await transactionModel
              .find({ credit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = inc1.map((item) => item.balance);
            const inc2 = await transactionModel
              .find({ debit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = inc2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            IncomePart.push({ name: incomeParty[i].name, amount: amount });
          }
          const totalIncome = collect(
            IncomePart.map((item) => item.amount)
          ).sum();

          /////// Net Profit ----------------///
          const SoldOrders = await orderModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });

          const totalCartItems = SoldOrders.reduce((res, item) => {
            res.push(item.cartItems);
            return res;
          }, []);
          const merge3 = totalCartItems.flat(1);
          const stockProducts = await productModel.find({
            companyId: companyId,
          });
          let totalPurchaseValue = 0;

          for (let i = 0; i < stockProducts?.length; i++) {
            for (let j = 0; j < merge3.length; j++) {
              if (stockProducts[i]._id == merge3[j].id) {
                totalPurchaseValue +=
                  stockProducts[i]?.purchase_price * merge3[j]?.quantity;
              }
            }
          }

          const COGS = totalPurchaseValue;
          const netProfit =
            totalSales + totalIncome - COGS - totalExpense - totalDiscount;

          // Equity
          const Equity = EquityAccount.map((item) => item.balance);
          const totalEquity = collect(Equity).sum();

          const actualEquity = -1 * (totalEquity - netProfit);

          responseReturn(res, 201, {
            startDate,
            endDate,
            cashAccount,
            mobileAccount,
            cardAccount,
            Account_PayableAccount,
            Account_ReceivableAccount,
            present_Inventory,
            totalProductsValue,
            Loan_GivenAccount,
            Loan_TakenAccount,
            AssetAccount,
            LiabilityAccount,
            EquityAccount,
            totalCurrentAsset,
            totalFixedAsset,
            totalCurrentLiability,
            totalLiability_Long,
            actualEquity,
            netProfit,
          });
        } else {
          const cash_party = await partyModel.find({
            accountType: "Cash",
            companyId: companyId,
          });
          const cashAccount = cash_party;
          // for (let i = 0; i < cash_party.length; i++) {
          //   const cash1 = await transactionModel
          //     .find({ companyId: companyId, debit: cash_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = cash1.map((item) => item.balance);
          //   const cash2 = await transactionModel
          //     .find({ companyId: companyId, credit: cash_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = cash2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const cash = amount1 - amount2;
          //   cashAccount.push({ name: cash_party[i].name, amount: cash });
          // }

          const mobile_party = await partyModel.find({
            accountType: "Mobile_Banking",
            companyId: companyId,
          });
          const mobileAccount = mobile_party;
          // for (let i = 0; i < mobile_party.length; i++) {
          //   const mobile1 = await transactionModel
          //     .find({ companyId: companyId, debit: mobile_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = mobile1.map((item) => item.balance);
          //   const mobile2 = await transactionModel
          //     .find({ companyId: companyId, credit: mobile_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = mobile2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const mobile = amount1 - amount2;
          //   mobileAccount.push({ name: mobile_party[i].name, amount: mobile });
          // }

          const card_party = await partyModel.find({
            accountType: "Card",
            companyId: companyId,
          });
          const cardAccount = card_party;
          // for (let i = 0; i < card_party.length; i++) {
          //   const card1 = await transactionModel
          //     .find({ companyId: companyId, debit: card_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = card1.map((item) => item.balance);
          //   const card2 = await transactionModel
          //     .find({ companyId: companyId, credit: card_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = card2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const card = amount1 - amount2;
          //   cardAccount.push({ name: card_party[i].name, amount: card });
          // }

          const Account_Payable_party = await partyModel.find({
            accountType: "Account_Payable",
            companyId: companyId,
          });
          const Account_PayableAccount = Account_Payable_party;
          // for (let i = 0; i < Account_Payable_party.length; i++) {
          //   const Account_Payable1 = await transactionModel
          //     .find({ companyId: companyId, debit: Account_Payable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Account_Payable1.map((item) => item.balance);
          //   const Account_Payable2 = await transactionModel
          //     .find({ companyId: companyId, credit: Account_Payable_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Account_Payable2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Account_Payable = amount1 - amount2;
          //   Account_PayableAccount.push({
          //     name: Account_Payable_party[i].name,
          //     amount: Account_Payable,
          //   });
          // }

          const Account_Receivable_party = await partyModel.find({
            accountType: "Account_Receivable",
            companyId: companyId,
          });
          const Account_ReceivableAccount = Account_Receivable_party;
          // for (let i = 0; i < Account_Receivable_party.length; i++) {
          //   const Account_Receivable1 = await transactionModel
          //     .find({
          //       companyId: companyId,
          //       debit: Account_Receivable_party[i],
          //     })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Account_Receivable1.map((item) => item.balance);
          //   const Account_Receivable2 = await transactionModel
          //     .find({
          //       companyId: companyId,
          //       credit: Account_Receivable_party[i],
          //     })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Account_Receivable2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Account_Receivable = amount1 - amount2;
          //   Account_ReceivableAccount.push({
          //     name: Account_Receivable_party[i].name,
          //     amount: Account_Receivable,
          //   });
          // }
          // Purchase
          const purchase_party = await partyModel.find({
            accountType: "Purchase_Account",
          });
          const purchaseTransactions = await transactionModel
            .find({ companyId: companyId, debit: purchase_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalPurchase = 0;

          for (let i = 0; i < purchaseTransactions?.length; i++) {
            totalPurchase += purchaseTransactions[i]?.balance;
          }

          // Purchase
          const Inventory_party = await partyModel.find({
            accountType: "Inventory",
          });
          const InventoryTransactions = await transactionModel
            .find({ companyId: companyId, debit: Inventory_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalInventory = 0;

          for (let i = 0; i < InventoryTransactions?.length; i++) {
            totalInventory += InventoryTransactions[i]?.balance;
          }
          // let present_Inventory = totalPurchase - totalInventory;
          let present_Inventory = 0;

          //Finish Goods

          const products = await productModel.find({ companyId: companyId });
          let ProductsValue = 0;

          for (let i = 0; i < products?.length; i++) {
            ProductsValue += products[i]?.purchase_price * products[i]?.stock;
          }

          const totalProductsValue = ProductsValue;
          const Loan_Given_party = await partyModel.find({
            accountType: "Loan_Given",
            companyId: companyId,
          });
          const Loan_GivenAccount = Loan_Given_party;
          // for (let i = 0; i < Loan_Given_party.length; i++) {
          //   const Loan_Given1 = await transactionModel
          //     .find({ companyId: companyId, debit: Loan_Given_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Loan_Given1.map((item) => item.balance);
          //   const Loan_Given2 = await transactionModel
          //     .find({ companyId: companyId, credit: Loan_Given_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Loan_Given2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Loan_Given = amount1 - amount2;
          //   Loan_GivenAccount.push({
          //     name: Loan_Given_party[i].name,
          //     amount: Loan_Given,
          //   });
          // }

          const Loan_Taken_party = await partyModel.find({
            accountType: "Loan_Taken",
            companyId: companyId,
          });
          const Loan_TakenAccount = Loan_Taken_party;
          // for (let i = 0; i < Loan_Taken_party.length; i++) {
          //   const Loan_Taken1 = await transactionModel
          //     .find({ companyId: companyId, debit: Loan_Taken_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Loan_Taken1.map((item) => item.balance);
          //   const Loan_Taken2 = await transactionModel
          //     .find({ companyId: companyId, credit: Loan_Taken_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Loan_Taken2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Loan_Taken = amount1 - amount2;
          //   Loan_TakenAccount.push({
          //     name: Loan_Taken_party[i].name,
          //     amount: Loan_Taken,
          //   });
          // }

          const Asset_party = await partyModel.find({
            accountType: "Asset",
            companyId: companyId,
          });
          const AssetAccount = Asset_party;
          // for (let i = 0; i < Asset_party.length; i++) {
          //   const Asset1 = await transactionModel
          //     .find({ companyId: companyId, debit: Asset_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Asset1.map((item) => item.balance);
          //   const Asset2 = await transactionModel
          //     .find({ companyId: companyId, credit: Asset_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Asset2.map((item) => item.balance);
          //   const amount1 = collect(allItems1).sum();
          //   const amount2 = collect(allItems2).sum();
          //   const Asset = amount1 - amount2;
          //   AssetAccount.push({ name: Asset_party[i].name, amount: Asset });
          // }

          const Liability_party = await partyModel.find({
            accountType: "Liability",
            companyId: companyId,
          });
          // const LiabilityAccount = [];
          // for (let i = 0; i < Liability_party.length; i++) {
          //   const Liability1 = await transactionModel
          //     .find({ companyId: companyId, debit: Liability_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Liability1.map((item) => item.balance);
          //   const Liability2 = await transactionModel
          //     .find({ companyId: companyId, credit: Liability_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Liability2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Liability = amount1 - amount2;
          //   LiabilityAccount.push({
          //     name: Liability_party[i].name,
          //     amount: Liability,
          //   });
          // }
          let LiabilityAccount = Liability_party;

          const Equity_party = await partyModel.find({
            accountType: "Equity",
            companyId: companyId,
          });

          //console.log(Equity_party);
          const EquityAccount = Equity_party;
          // for (let i = 0; i < Equity_party.length; i++) {
          //   const Equity1 = await transactionModel
          //     .find({ companyId: companyId, debit: Equity_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems1 = Equity1.map((item) => item.balance);
          //   const Equity2 = await transactionModel
          //     .find({ companyId: companyId, credit: Equity_party[i] })
          //     .where({ date: { $gte: startDate, $lte: endDate } });
          //   const allItems2 = Equity2.map((item) => item.balance);
          //   const amount2 = collect(allItems1).sum();
          //   const amount1 = collect(allItems2).sum();
          //   const Equity = amount1 - amount2;
          //   EquityAccount.push({ name: Equity_party[i].name, amount: Equity });
          // }

          // Total Current Asset
          const cashItem = cashAccount.map((item) => item.balance);
          const totalCash = collect(cashItem).sum();

          const mobileItem = mobileAccount.map((item) => item.balance);
          const totalMobile = collect(mobileItem).sum();

          const cardItem = cardAccount.map((item) => item.balance);
          const totalCard = collect(cardItem).sum();

          const acItem = Account_ReceivableAccount.map((item) => item.balance);
          const totalAc = collect(acItem).sum();

          const Loan_Given = Loan_GivenAccount.map((item) => item.balance);
          const totalLoan_Given = collect(Loan_Given).sum();

          const totalCurrentAsset =
            totalCash +
            totalMobile +
            totalCard +
            totalAc +
            present_Inventory +
            totalLoan_Given +
            totalProductsValue;
          // Total Fixed Asset

          const Fixed_Asset = AssetAccount.map((item) => item.balance);
          const totalFixedAsset = collect(Fixed_Asset).sum();

          // Total Current Liability

          const Account_Pay = Account_PayableAccount.map(
            (item) => item.balance
          );
          const totalAccount_Pay = -1 * collect(Account_Pay).sum();

          const Loan_Taken = Loan_TakenAccount.map((item) => item.balance);
          const totalLoan_Taken = -1 * collect(Loan_Taken).sum();

          const totalCurrentLiability = totalAccount_Pay + totalLoan_Taken;

          // Long Term Liability
          const Liability_Long = LiabilityAccount.map((item) => item.balance);
          const totalLiability_Long = collect(Liability_Long).sum();

          ///// ----------------------- Net Profit ------------------------ ///
          const transactions = await transactionModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          //Income Part
          const incomeTransaction = await transactionModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const incomeItems = incomeTransaction.reduce((res, item) => {
            res.push({ credit: item.credit });
            return res;
          }, []);

          let incomeObject = incomeItems.map(JSON.stringify);
          let incomeSet = new Set(incomeObject);
          const incomeArray = Array.from(incomeSet).map(JSON.parse);
          const incomeLast = incomeArray.map((s) => Object.values(s));
          const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
          const incomeParty = await partyModel
            .find({ _id: { $in: incomeResult }, accountType: "Income" })
            .sort({ name: 1 });
          //Expense Part
          const expenseTransaction = await transactionModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });
          const expenseItems = expenseTransaction.reduce((res, item) => {
            res.push({ debit: item.debit });
            return res;
          }, []);
          let expenseObject = expenseItems.map(JSON.stringify);
          let expenseSet = new Set(expenseObject);
          const expenseArray = Array.from(expenseSet).map(JSON.parse);
          const expenseLast = expenseArray.map((s) => Object.values(s));
          const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
          const expenseParty = await partyModel
            .find({ _id: { $in: expenseResult }, accountType: "Expense" })
            .sort({ name: 1 });
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
          //Discount
          const discount_party = await partyModel.find({
            accountType: "Discount",
          });
          const discountTransactions = await transactionModel
            .find({ companyId: companyId, debit: discount_party })
            .where({ date: { $gte: startDate, $lte: endDate } });

          let totalDiscount = 0;

          for (let i = 0; i < discountTransactions?.length; i++) {
            totalDiscount += discountTransactions[i]?.balance;
          }

          //Expense Calculate

          let ExpensePart = [];

          for (let i = 0; i < expenseParty.length; i++) {
            const exp1 = await transactionModel
              .find({ debit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = exp1.map((item) => item.balance);
            const exp2 = await transactionModel
              .find({ credit: expenseParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = exp2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            ExpensePart.push({ name: expenseParty[i].name, amount: amount });
          }
          const totalExpense = collect(
            ExpensePart.map((item) => item.amount)
          ).sum();
          //Income Calculate

          let IncomePart = [];

          for (let i = 0; i < incomeParty.length; i++) {
            const inc1 = await transactionModel
              .find({ credit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems1 = inc1.map((item) => item.balance);
            const inc2 = await transactionModel
              .find({ debit: incomeParty[i] })
              .where({ date: { $gte: startDate, $lte: endDate } });
            const allItems2 = inc2.map((item) => item.balance);
            const amount1 = collect(allItems1).sum();
            const amount2 = collect(allItems2).sum();
            const amount = amount1 - amount2;
            IncomePart.push({ name: incomeParty[i].name, amount: amount });
          }
          const totalIncome = collect(
            IncomePart.map((item) => item.amount)
          ).sum();

          /////// Net Profit ----------------///
          const SoldOrders = await orderModel
            .find({ companyId: companyId })
            .where({ date: { $gte: startDate, $lte: endDate } });

          const totalCartItems = SoldOrders.reduce((res, item) => {
            res.push(item.cartItems);
            return res;
          }, []);
          const merge3 = totalCartItems.flat(1);
          const stockProducts = await productModel.find({
            companyId: companyId,
          });
          let totalPurchaseValue = 0;

          for (let i = 0; i < stockProducts?.length; i++) {
            for (let j = 0; j < merge3.length; j++) {
              if (stockProducts[i]._id == merge3[j].id) {
                totalPurchaseValue +=
                  stockProducts[i]?.purchase_price * merge3[j]?.quantity;
              }
            }
          }

          const COGS = totalPurchaseValue;
          const netProfit =
            totalSales + totalIncome - COGS - totalExpense - totalDiscount;
          // const netProfit = 0
          // Equity
          const Equity = EquityAccount.map((item) => item.balance);
          const totalEquity = collect(Equity).sum();

          const actualEquity = -1 * (totalEquity - netProfit);

          responseReturn(res, 201, {
            startDate,
            endDate,
            cashAccount,
            mobileAccount,
            cardAccount,
            Account_PayableAccount,
            Account_ReceivableAccount,
            present_Inventory,
            totalProductsValue,
            Loan_GivenAccount,
            Loan_TakenAccount,
            AssetAccount,
            LiabilityAccount,
            EquityAccount,
            totalCurrentAsset,
            totalFixedAsset,
            totalCurrentLiability,
            totalLiability_Long,
            actualEquity,
            netProfit,
          });
        }
      }
    } catch (error) {}
  };

  account_type = async (req, res) => {
    const { id, role } = req;
    if (role === "staff") {
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }
    const { accountType } = req.body;
    //console.log(account);
    try {
      const parties = await partyModel.find({
        accountType: accountType,
        companyId: companyId,
      });
      responseReturn(res, 201, {
        parties,
        accountType,
      });
    } catch (error) {}
  };

  day_book = async (req, res) => {
    const { id, role } = req;
    if (role === "staff") {
      var { branchId } = await staffModel.findById(id);
    } else {
      var branchId = req.body.branchId;
    }
    const { date } = req.body;
    const startDate = date.startDate;
    console.log(startDate);
    const endDate = date.endDate;
    console.log(endDate);
    try {
      const transactions = await transactionModel
        .find({ branchId: branchId })
        .where({ date: { $gte: startDate, $lte: endDate } })
        .populate("credit")
        .populate("debit");
      responseReturn(res, 201, {
        transactions,
        startDate,
        endDate,
      });
    } catch (error) {}
  };
}

module.exports = new transactionController();
