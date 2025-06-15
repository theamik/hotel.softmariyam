const categoryModel = require("../../models/categoryModel");
const inventoryModel = require("../../models/inventoryModel");
const ownerModel = require("../../models/ownerModel");
const reservationModel = require("../../models/reservationModel");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const moment = require("moment");

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

  get_available_rooms = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const startDate = moment(req.query.startDate).format("YYYY-MM-DD");

    const selectedDate = new Date(startDate);
    var inDate = moment(selectedDate).format("YYYY-MM-DD");

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    var outDate = moment(nextDay).format("YYYY-MM-DD");
    try {
      // 1. Get all rooms of the company
      const allRooms = await roomModel
        .find({ companyId })
        .populate("categoryId");

      // 2. Find all reservations that overlap with the date
      const reservations = await reservationModel.find({
        status: { $ne: "cancel" },
        checkInDate: { $lt: outDate },
        checkOutDate: { $gt: inDate },
        companyId: companyId,
      });
      // 3. Collect all reserved room IDs
      const reservedRoomIds = reservations?.flatMap((res) =>
        res.roomDetails.map((detail) => detail.roomId.toString())
      );

      // 4. Filter out reserved rooms
      const availableRooms = allRooms
        .filter((room) => !reservedRoomIds.includes(room._id.toString()))
        .sort((a, b) => a.name.localeCompare(b.name));

      // 5. Return the result
      responseReturn(res, 200, { rooms: availableRooms });
    } catch (error) {
      console.log("Error fetching available rooms:", error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_available_rooms_for_edit = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const { startDate, reservationId } = req.query; // startDate is for availability check, reservationId is the current reservation being edited

    if (!startDate || !reservationId) {
      return responseReturn(res, 400, {
        message: "Start date and Reservation ID are required.",
      });
    }

    const selectedDate = new Date(startDate);
    var inDate = moment(selectedDate).format("YYYY-MM-DD");

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    var outDate = moment(nextDay).format("YYYY-MM-DD");
    try {
      // 1. Get all rooms of the company
      const allRooms = await roomModel.find({ companyId });

      // 2. Find all reservations that overlap with the date
      const reservations = await reservationModel.find({
        _id: { $ne: reservationId },
        status: { $ne: "cancel" },
        checkInDate: { $lt: outDate },
        checkOutDate: { $gte: inDate },
        companyId: companyId,
      });
      // 3. Collect all reserved room IDs
      const reservedRoomIds = reservations?.flatMap((res) =>
        res.roomDetails.map((detail) => detail.roomId.toString())
      );

      // 4. Filter out reserved rooms
      const availableRooms = allRooms
        .filter((room) => !reservedRoomIds.includes(room._id.toString()))
        .sort((a, b) => a.name.localeCompare(b.name));
      // 5. Return the result
      responseReturn(res, 200, { rooms: availableRooms });
    } catch (error) {
      console.log("Error fetching available rooms:", error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_booked_rooms = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const startDate = moment(req.query.startDate).format("YYYY-MM-DD");

    const selectedDate = new Date(startDate);
    var inDate = moment(selectedDate).format("YYYY-MM-DD");

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    var outDate = moment(nextDay).format("YYYY-MM-DD");

    try {
      // 1. Get all rooms of the company
      const allRooms = await roomModel.find({ companyId });

      // 2. Find all reservations that overlap with the date
      const reservations = await reservationModel.find({
        status: { $ne: "cancel" },
        checkInDate: { $lt: outDate },
        checkOutDate: { $gt: inDate },
        companyId: companyId,
      });
      // 3. Safely collect reserved room IDs
      const reservedRoomIds = reservations.flatMap((res) =>
        Array.isArray(res.roomDetails)
          ? res.roomDetails.map((detail) => detail.roomId.toString())
          : []
      );

      // 4. Filter rooms that are booked
      const bookedRooms = allRooms
        .filter((room) => reservedRoomIds.includes(room._id.toString()))
        .sort((a, b) => a.name.localeCompare(b.name));
      // 5. Return the result
      responseReturn(res, 200, { bookedRooms });
    } catch (error) {
      console.log("Error fetching booked rooms:", error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_booked_rooms_for_edit = async (req, res) => {
    const { id } = req;
    const { companyId } = await ownerModel.findById(id);
    const { startDate, reservationId } = req.query; // startDate is for availability check, reservationId is the current reservation being edited

    if (!startDate || !reservationId) {
      return responseReturn(res, 400, {
        message: "Start date and Reservation ID are required.",
      });
    }

    const selectedDate = new Date(startDate);
    var inDate = moment(selectedDate).format("YYYY-MM-DD");

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    var outDate = moment(nextDay).format("YYYY-MM-DD");

    try {
      // 1. Get all rooms of the company
      const allRooms = await roomModel.find({ companyId });

      // 2. Find all reservations that overlap with the date
      const reservations = await reservationModel.find({
        _id: { $ne: reservationId },
        status: { $ne: "cancel" },
        checkInDate: { $lt: outDate },
        checkOutDate: { $gte: inDate },
        companyId: companyId,
      });
      // 3. Safely collect reserved room IDs
      const reservedRoomIds = reservations.flatMap((res) =>
        Array.isArray(res.roomDetails)
          ? res.roomDetails.map((detail) => detail.roomId.toString())
          : []
      );

      // 4. Filter rooms that are booked
      const bookedRooms = allRooms
        .filter((room) => reservedRoomIds.includes(room._id.toString()))
        .sort((a, b) => a.name.localeCompare(b.name));
      console.log(bookedRooms);
      // 5. Return the result
      responseReturn(res, 200, { bookedRooms });
    } catch (error) {
      console.log("Error fetching booked rooms:", error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_room = async (req, res) => {
    const { roomId } = req.params;

    try {
      const room = await roomModel.findById(roomId).populate("categoryId");
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
