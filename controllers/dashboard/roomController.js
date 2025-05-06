const categoryModel = require("../../models/categoryModel");
const inventoryModel = require("../../models/inventoryModel");
const ownerModel = require("../../models/ownerModel");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const {
  mongo: { ObjectId },
} = require("mongoose");
const staffModel = require("../../models/staffModel");
const roomModel = require("../../models/roomModel");

class roomController {
  add_category = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const { name, occupancy, rackRate, discountRate, description, status } =
      req.body;
    try {
      const category = await categoryModel.create({
        name: name,
        occupancy: occupancy,
        rackRate: rackRate,
        discountRate: discountRate,
        description: description,
        status: status,
        companyId: companyId,
      });
      responseReturn(res, 201, {
        category,
        message: "Category added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_category = async (req, res) => {
    const {
      name,
      occupancy,
      rackRate,
      discountRate,
      description,
      status,
      categoryId,
    } = req.body;
    let Id = categoryId;
    try {
      const category = await categoryModel.findByIdAndUpdate(Id, {
        name: name,
        occupancy: occupancy,
        rackRate: rackRate,
        discountRate: discountRate,
        description: description,
        status: status,
      });
      responseReturn(res, 201, {
        message: "Category updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_categories = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    try {
      const categories = await categoryModel
        .find({ companyId: companyId })
        .sort({ name: 1 })
        .populate("roomId");
      const totalCategory = await categoryModel.find({}).countDocuments();
      responseReturn(res, 200, { totalCategory, categories });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_category = async (req, res) => {
    const { categoryId } = req.params;

    try {
      const category = await categoryModel.findById(categoryId);
      responseReturn(res, 200, { category });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  add_room = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const { name, categoryId, description, status } = req.body;
    try {
      const room = await roomModel.create({
        name: name,
        description: description,
        status: status,
        categoryId: new ObjectId(categoryId),
        companyId: companyId,
      });
      const newId = room.id;
      const category = await categoryModel.findById(categoryId);
      const test = category.roomId;
      test.push(newId);
      await category.save();
      responseReturn(res, 201, {
        room,
        message: "Room added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_room = async (req, res) => {
    const { name, categoryId, description, status, roomId } = req.body;

    if (!categoryId) {
      responseReturn(res, 404, { error: "Please select room category!" });
    } else {
      let Id = roomId;
      try {
        const room = await roomModel.findByIdAndUpdate(Id, {
          name: name,
          description: description,
          status: status,
          categoryId: new ObjectId(categoryId),
        });
        const newId = new ObjectId(Id);
        const categories = await categoryModel.find({});
        for (let j = 0; j < categories.length; j++) {
          for (let i = 0; i < categories[j].roomId.length; i++) {
            categories[j].roomId.pull(newId);
            await categories[j].save();
          }
        }

        const category = await categoryModel.findById(categoryId);
        const test = category.roomId;
        test.push(newId);
        await category.save();
        responseReturn(res, 201, {
          room,
          message: "Room updated successfully",
        });
      } catch (error) {
        responseReturn(res, 500, { error: "Internal server error" });
      }
    }
  };

  get_rooms = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    try {
      const rooms = await roomModel
        .find({ companyId: companyId })
        .sort({ name: 1 })
        .populate("categoryId");
      const totalRoom = await roomModel
        .find({ companyId: companyId })
        .countDocuments();
      responseReturn(res, 200, { totalRoom, rooms });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_room = async (req, res) => {
    const { roomId } = req.params;

    try {
      const room = await roomModel.findById(roomId);
      responseReturn(res, 200, { room });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  add_inventory = async (req, res) => {
    const { id } = req;
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "something error" });
      } else {
        let { name, unit } = fields;
        const { companyId } = await ownerModel.findById(id);
        try {
          const inventory = await inventoryModel.create({
            name: name.toString(),
            unit: unit.toString(),
            quantity: 0,
            price: 0,
            total: 0,
            companyId: new ObjectId(companyId),
          });
          responseReturn(res, 201, {
            inventory,
            message: "Inventory added successfully",
          });
        } catch (error) {
          responseReturn(res, 500, { error: "Internal server error" });
        }
      }
    });
  };

  update_inventory = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "something error" });
      } else {
        let { name, inventoryId, unit } = fields;

        let Id = inventoryId.toString();
        try {
          const inventory = await inventoryModel.findByIdAndUpdate(Id, {
            name: name.toString(),
            unit: unit.toString(),
          });
          responseReturn(res, 201, {
            inventory,
            message: "Inventory updated successfully",
          });
        } catch (error) {
          responseReturn(res, 500, { error: "Internal server error" });
        }
      }
    });
  };

  get_inventories = async (req, res) => {
    const { id } = req;
    const { page, searchValue, parPage } = req.query;
    try {
      const { companyId } = await ownerModel.findById(id);
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const inventories = await inventoryModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 });
        //console.log(inventories)
        const totalInventory = await inventoryModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
          })
          .countDocuments();
        //console.log(totalInventory)
        responseReturn(res, 200, { totalInventory, inventories });
      } else if (searchValue === "" && page && parPage) {
        const inventories = await inventoryModel
          .find({ companyId: companyId })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 });
        const totalInventory = await inventoryModel
          .find({ companyId: companyId })
          .countDocuments();
        responseReturn(res, 200, { totalInventory, inventories });
      } else {
        const inventories = await inventoryModel
          .find({ companyId: companyId })
          .sort({ updatedAt: -1 });
        const totalInventory = await inventoryModel
          .find({ companyId: companyId })
          .countDocuments();
        responseReturn(res, 200, { totalInventory, inventories });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_out_rooms = async (req, res) => {
    const { id } = req;
    const { page, searchValue, parPage } = req.query;
    try {
      const { companyId } = await ownerModel.findById(id);
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const inventories = await inventoryModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
            quantity: { $lt: 0 },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 });
        //console.log(inventories)
        const totalInventory = await inventoryModel
          .find({
            $text: { $search: searchValue },
            companyId: companyId,
            quantity: { $lt: 0 },
          })
          .countDocuments();
        //console.log(totalInventory)
        responseReturn(res, 200, { totalInventory, inventories });
      } else if (searchValue === "" && page && parPage) {
        const inventories = await inventoryModel
          .find({ companyId: companyId, quantity: { $lt: 0 } })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 });
        const totalInventory = await inventoryModel
          .find({ companyId: companyId, quantity: { $lt: 0 } })
          .countDocuments();
        responseReturn(res, 200, { totalInventory, inventories });
      } else {
        const inventories = await inventoryModel
          .find({ companyId: companyId, quantity: { $lt: 0 } })
          .sort({ updatedAt: -1 });
        const totalInventory = await inventoryModel
          .find({ companyId: companyId, quantity: { $lt: 0 } })
          .countDocuments();
        responseReturn(res, 200, { totalInventory, inventories });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_inventory = async (req, res) => {
    const { inventoryId } = req.params;

    try {
      const inventory = await inventoryModel.findById(inventoryId);
      responseReturn(res, 200, { inventory });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new roomController();
