const menuModel = require("../../models/menuModel");
const inventoryModel = require("../../models/inventoryModel");
const ownerModel = require("../../models/ownerModel");
const cloudinary = require("../../utils/cloudinaryConfig");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const slugify = require("slugify");
const {
  mongo: { ObjectId },
} = require("mongoose");
const staffModel = require("../../models/staffModel");
const foodModel = require("../../models/foodModel");
const tableModel = require("../../models/tableModel");
const guestModel = require("../../models/guestModel.js");
const moment = require("moment");

class foodController {
  add_menu = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);

    const { name, description, status } = req.body;
    try {
      const menu = await menuModel.create({
        name: name,
        description: description,
        status: status,
        companyId: companyId,
      });
      responseReturn(res, 201, {
        menu,
        message: "Menu added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_menu = async (req, res) => {
    const { name, description, status, menuId } = req.body;
    let Id = menuId;
    try {
      const menu = await menuModel.findByIdAndUpdate(Id, {
        name: name,
        description: description,
        status: status,
      });
      responseReturn(res, 201, {
        menu,
        message: "Menu updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_menus = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    try {
      const menus = await menuModel
        .find({ companyId: companyId })
        .sort({ name: 1 });
      const totalMenu = await menuModel
        .find({ companyId: companyId })
        .countDocuments();
      responseReturn(res, 200, { totalMenu, menus });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_menu = async (req, res) => {
    const { menuId } = req.params;

    try {
      const menu = await menuModel.findById(menuId);
      responseReturn(res, 200, { menu });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  add_food = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    const { name, menuId, description, duration, price, status } = req.body;
    try {
      const food = await foodModel.create({
        name: name,
        description: description,
        status: status,
        price: price,
        duration: duration,
        menuId: new ObjectId(menuId),
        companyId: companyId,
      });

      const newId = new ObjectId(food.id);

      const menu = await menuModel.findById(menuId);
      const test = menu.foodId;
      test.push(newId);
      await menu.save();
      responseReturn(res, 201, {
        food,
        message: "Food added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_food = async (req, res) => {
    const { name, menuId, description, duration, price, status, foodId } =
      req.body;

    if (!menuId) {
      responseReturn(res, 404, { error: "Please select food menu!" });
    } else {
      let Id = foodId;
      try {
        const food = await foodModel.findByIdAndUpdate(Id, {
          name: name,
          description: description,
          status: status,
          duration: duration,
          price: price,
          menuId: new ObjectId(menuId),
        });
        const newId = new ObjectId(Id);
        const menus = await menuModel.find({});
        for (let j = 0; j < menus.length; j++) {
          for (let i = 0; i < menus[j].foodId.length; i++) {
            menus[j].foodId.pull(newId);
            await menus[j].save();
          }
        }

        const menu = await menuModel.findById(menuId);
        const test = menu.foodId;
        test.push(newId);
        await menu.save();
        responseReturn(res, 201, {
          food,
          message: "Food updated successfully",
        });
      } catch (error) {
        responseReturn(res, 500, { error: "Internal server error" });
      }
    }
  };

  get_foods = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    try {
      const foods = await foodModel
        .find({ companyId: companyId })
        .sort({ name: 1 })
        .populate("menuId");
      const totalFood = await foodModel
        .find({ companyId: companyId })
        .countDocuments();
      responseReturn(res, 200, { totalFood, foods });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_food = async (req, res) => {
    const { foodId } = req.params;

    try {
      const food = await foodModel.findById(foodId);
      responseReturn(res, 200, { food });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  menu_foods = async (req, res) => {
    const { menuId } = req.params;

    try {
      const foods = await foodModel.find({ menuId: menuId });
      responseReturn(res, 200, { foods });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_out_foods = async (req, res) => {
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
  add_table = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);

    const { name, description, position, occupancy, status } = req.body;
    try {
      const table = await tableModel.create({
        name: name,
        description: description,
        status: status,
        occupancy: occupancy,
        position: position,
        companyId: companyId,
      });

      responseReturn(res, 201, {
        table,
        message: "Table added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_table = async (req, res) => {
    const { name, description, position, occupancy, status, tableId } =
      req.body;

    try {
      const tables = await tableModel.findByIdAndUpdate(tableId, {
        name: name,
        description: description,
        status: status,
        position: position,
        occupancy: occupancy,
      });

      responseReturn(res, 201, {
        tables,
        message: "Table updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_tables = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    try {
      const tables = await tableModel
        .find({ companyId: companyId })
        .sort({ name: 1 });
      const totalTable = await tableModel
        .find({ companyId: companyId })
        .countDocuments();
      responseReturn(res, 200, { totalTable, tables });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_table = async (req, res) => {
    const { tableId } = req.params;

    try {
      const table = await tableModel.findById(tableId);
      responseReturn(res, 200, { table });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  add_guest = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    const { name, address, mobile, description, date, status, under } =
      req.body;
    if (date) {
      var tempDate = moment(date).format();
    } else {
      var tempDate = moment(Date.now()).format();
    }
    if (!name || !address || !mobile || !description) {
      responseReturn(res, 404, { error: "Please fill guest information!" });
      return;
    }
    try {
      const guest = await guestModel.create({
        name,
        address,
        mobile,
        description,
        date: tempDate,
        status,
        companyId: companyId,
        under: under,
      });

      responseReturn(res, 201, {
        guest,
        message: "Guest added successfully",
      });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_guest = async (req, res) => {
    const { name, address, mobile, description, status, guestId } = req.body;
    try {
      const guests = await guestModel.findByIdAndUpdate(guestId, {
        name,
        address,
        mobile,
        description,
        status,
      });

      responseReturn(res, 201, {
        guests,
        message: "Guest updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_guests = async (req, res) => {
    const { id } = req;

    const { companyId } = await ownerModel.findById(id);
    try {
      const guests = await guestModel
        .find({ companyId: companyId, under: "hotel" })
        .sort({ updatedAt: -1 });
      const totalGuest = await guestModel
        .find({ companyId: companyId, under: "hotel" })
        .countDocuments();
      responseReturn(res, 200, { totalGuest, guests });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_hotel_guests = async (req, res) => {
    const { id } = req;
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.perPage) || 10;
    const statusFilter = req.query.status;
    const under = req.query.under; // Get status from query
    const searchQuery = req.query.searchQuery; // Get search query
    const skip = (currentPage - 1) * itemsPerPage;

    try {
      const owner = await ownerModel.findById(id);
      if (!owner) {
        return responseReturn(res, 404, { error: "Owner not found" });
      }
      const { companyId } = owner;

      let query = { companyId: companyId, under: under };

      // Apply status filter if provided
      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      // Apply search query if provided
      if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, "i"); // Case-insensitive search
        // Use $or to search across 'name' AND 'mobile' using $regex
        // IMPORTANT: Ensure query.$or is applied directly, not nested if it leads to conflict
        query.$or = [
          { name: { $regex: searchRegex } },
          { mobile: { $regex: searchRegex } },
        ];
      }

      // Debugging step: Log the final query object

      const guests = await guestModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(itemsPerPage);

      const totalGuests = await guestModel.countDocuments(query);
      responseReturn(res, 200, { totalGuests, guests });
    } catch (error) {
      console.error("Error fetching hotel guests:", error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_guest = async (req, res) => {
    const { guestId } = req.params;

    try {
      const guest = await guestModel.findById(guestId);
      responseReturn(res, 200, { guest });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new foodController();
