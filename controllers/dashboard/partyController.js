const partyModel = require("../../models/partyModel");
const ownerModel = require("../../models/ownerModel");
const cloudinary = require("../../utils/cloudinaryConfig");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const slugify = require("slugify");
const {
  mongo: { ObjectId },
} = require("mongoose");
const staffModel = require("../../models/staffModel");

class partyController {
  add_party = async (req, res) => {
    const { id } = req;
    let { name, address, mobile, description, accountType, under } = req.body;
    const { companyId } = await ownerModel.findById(id);
    try {
      const party = await partyModel.create({
        name: name,
        address: address,
        mobile: mobile,
        description: description,
        accountType: accountType,
        under: under,
        companyId: new ObjectId(companyId),
      });
      responseReturn(res, 201, {
        party,
        message: "Account added successfully",
      });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_party = async (req, res) => {
    let { name, address, mobile, description, accountType, under, partyId } =
      req.body;
    let Id = partyId;
    try {
      const party = await partyModel.findByIdAndUpdate(Id, {
        name: name,
        address: address,
        mobile: mobile,
        description: description,
        accountType: accountType,
        under: under,
      });
      responseReturn(res, 201, {
        message: "Account updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_parties = async (req, res) => {
    const { id } = req;
    const { page, searchValue, parPage } = req.query;
    const { companyId } = await ownerModel.findById(id);
    try {
      const parties = await partyModel.find({}).sort({ name: 1 });
      const totalParty = await partyModel.find({}).countDocuments();
      responseReturn(res, 200, { totalParty, parties });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_payment_parties = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    const { id, role } = req;
    if (role === "staff") {
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const parties = await partyModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        //console.log(totalParty)
        responseReturn(res, 200, { totalParty, parties });
      } else if (searchValue === "" && page && parPage) {
        const parties = await partyModel
          .find({ companyId: companyId })
          .skip(skipPage)
          .limit(parPage)
          .sort({ name: 1 });
        const totalParty = await partyModel.find({}).countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      } else {
        const parties = await partyModel
          .find({ companyId: companyId })
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({ companyId: companyId })
          .countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_purchase_parties = async (req, res) => {
    const { id } = req;
    const { page, searchValue, parPage } = req.query;
    const { companyId } = await ownerModel.findById(id);
    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const parties = await partyModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
            accountType: "Account_Payable",
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        //console.log(totalParty)
        responseReturn(res, 200, { totalParty, parties });
      } else if (searchValue === "" && page && parPage) {
        const parties = await partyModel
          .find({ companyId: companyId, accountType: "Account_Payable" })
          .skip(skipPage)
          .limit(parPage)
          .sort({ name: 1 });
        const totalParty = await partyModel.find({}).countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      } else {
        const parties = await partyModel
          .find({ companyId: companyId, accountType: "Account_Payable" })
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({ companyId: companyId, accountType: "Account_Payable" })
          .countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  account_type_parties = async (req, res) => {
    const { id, role } = req;
    const { accountType } = req.query;
    if (role === "staff") {
      var { companyId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }

    try {
      if (accountType === "") {
        const parties = await partyModel
          .find({ companyId: companyId })
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({ companyId: companyId })
          .countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      } else {
        const parties = await partyModel
          .find({ companyId: companyId, accountType: accountType })
          .sort({ name: 1 });
        const totalParty = await partyModel
          .find({ companyId: companyId, accountType: accountType })
          .countDocuments();
        responseReturn(res, 200, { totalParty, parties });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_party = async (req, res) => {
    const { partyId } = req.params;

    try {
      const party = await partyModel.findById(partyId);
      responseReturn(res, 200, { party });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new partyController();
