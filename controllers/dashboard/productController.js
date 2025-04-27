const productModel = require("../../models/productModel");
const ownerModel = require("../../models/ownerModel");
const cloudinary = require("../../utils/cloudinaryConfig");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const slugify = require("slugify");
const {
  mongo: { ObjectId },
} = require("mongoose");
const staffModel = require("../../models/staffModel");
const inventoryModel = require("../../models/inventoryModel");
const partyModel = require("../../models/partyModel");
const moment = require("moment");
const transactionModel = require("../../models/transactionModel");

class productController {
  add_product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let {
        name,
        branch,
        category,
        description,
        stock,
        unit,
        price,
        discount,
      } = field;
      const { image } = files;
      if (!image) {
        responseReturn(res, 400, { error: "Image is required" });
        return;
      }
      let filepath = image.map((item) => item.filepath);
      let path = filepath.toString();
      const slug = slugify(name.toString(), { replacement: "-", lower: true });
      const { companyId } = await ownerModel.findById(id);
      console.log(branch.toString());
      console.log(companyId);
      console.log(id);
      try {
        const result = await cloudinary.uploader.upload(path, {
          folder: "foodaleeza/product",
        });
        await productModel.create({
          ownerId: id,
          name: name.toString(),
          slug,
          category: category.toString(),
          branch: branch.toString(),
          description: description.toString(),
          stock: parseInt(stock),
          unit: unit.toString(),
          price: parseInt(price),
          discount: discount ? parseInt(discount) : 0,
          image: result.url,
          companyId: new ObjectId(companyId),
        });
        responseReturn(res, 201, { message: "Product added successfully" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  products_get = async (req, res) => {
    const { page, searchValue } = req.query;
    const { id, role } = req;
    const parPage = 50000;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (role === "staff") {
        const { companyId } = await staffModel.findById(id);
        if (searchValue) {
          if (searchValue != "All") {
            const products = await productModel
              .find({
                $text: { $search: searchValue },
                companyId: companyId,
              })
              .skip(skipPage)
              .limit(parPage)
              .sort({ name: 1 });
            const totalProduct = await productModel
              .find({
                $text: { $search: searchValue },
                companyId: companyId,
              })
              .countDocuments();
            responseReturn(res, 200, { totalProduct, products });
          } else {
            const products = await productModel
              .find({ companyId: companyId })
              .skip(skipPage)
              .limit(parPage)
              .sort({ name: 1 });
            const totalProduct = await productModel
              .find({ companyId: companyId })
              .countDocuments();
            responseReturn(res, 200, { totalProduct, products });
          }
        } else {
          const products = await productModel
            .find({ companyId: companyId })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({ companyId: companyId })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        }
      } else {
        if (searchValue) {
          const { companyId } = await ownerModel.findById(id);
          if (searchValue != "All") {
            const products = await productModel
              .find({
                $text: { $search: searchValue },
                ownerId: id,
              })
              .skip(skipPage)
              .limit(parPage)
              .sort({ name: 1 });
            const totalProduct = await productModel
              .find({
                $text: { $search: searchValue },
                ownerId: id,
              })
              .countDocuments();
            responseReturn(res, 200, { totalProduct, products });
          } else {
            const products = await productModel
              .find({ companyId: companyId })
              .skip(skipPage)
              .limit(parPage)
              .sort({ name: 1 });
            const totalProduct = await productModel
              .find({ companyId: companyId })
              .countDocuments();
            responseReturn(res, 200, { totalProduct, products });
          }
        } else {
          const { companyId } = await ownerModel.findById(id);
          const products = await productModel
            .find({ companyId: companyId })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({ companyId: companyId })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        }
      }
    } catch (error) {
      responseReturn(res, 404, { error: error.message });
    }
  };

  out_products_get = async (req, res) => {
    const { page, searchValue } = req.query;
    const { id, role } = req;
    const parPage = 500000;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (role === "staff") {
        const { companyId } = await staffModel.findById(id);
        if (searchValue) {
          const products = await productModel
            .find({
              $text: { $search: searchValue },
              companyId: companyId,
              stock: { $lt: 1 },
            })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({
              $text: { $search: searchValue },
              companyId: companyId,
              stock: { $lt: 1 },
            })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        } else {
          const products = await productModel
            .find({ companyId: companyId, stock: { $lt: 1 } })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({ companyId: companyId, stock: { $lt: 1 } })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        }
      } else {
        if (searchValue) {
          const { companyId } = await ownerModel.findById(id);
          const products = await productModel
            .find({
              $text: { $search: searchValue },
              companyId: companyId,
              stock: { $lt: 1 },
            })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({
              $text: { $search: searchValue },
              companyId: companyId,
              stock: { $lt: 1 },
            })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        } else {
          const { companyId } = await ownerModel.findById(id);
          const products = await productModel
            .find({ companyId: companyId, stock: { $lt: 1 } })
            .skip(skipPage)
            .limit(parPage)
            .sort({ name: 1 });
          const totalProduct = await productModel
            .find({ companyId: companyId, stock: { $lt: 1 } })
            .countDocuments();
          responseReturn(res, 200, { totalProduct, products });
        }
      }
    } catch (error) {
      responseReturn(res, 404, { error: error.message });
    }
  };

  product_get = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, { product });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  product_update = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let {
        name,
        category,
        description,
        stock,
        unit,
        price,
        discount,
        productId,
      } = field;
      console.log(unit);
      const { image } = files;
      const slug = slugify(name.toString(), { replacement: "-", lower: true });
      const { companyId } = await ownerModel.findById(id);

      try {
        if (image !== undefined) {
          const available = await productModel.findById(productId);
          let temp = available.image.split("/");
          temp = temp[temp.length - 1];
          const imageName = temp.split(".")[0];
          await cloudinary.uploader.destroy(imageName);
          let filepath = image.map((item) => item.filepath);
          let path = filepath.toString();
          const result = await cloudinary.uploader.upload(path, {
            folder: "foodaleeza/product",
          });
          if (result) {
            const product = await productModel.findByIdAndUpdate(productId, {
              name: name.toString(),
              slug,
              category: category.toString(),
              description: description.toString(),
              unit: unit.toString(),
              price: parseInt(price),
              discount: discount ? parseInt(discount) : 0,
              image: result.url,
              companyId: new ObjectId(companyId),
            });

            // (product.stock = product.stock + parseInt(stock)),
            await product.save();
            responseReturn(res, 201, {
              product,
              message: "Product updated successfully",
            });
          } else {
            responseReturn(res, 404, { error: "Image upload failed" });
          }
        } else {
          const product = await productModel.findByIdAndUpdate(productId, {
            name: name.toString(),
            slug,
            unit: unit.toString(),
            category: category.toString(),
            description: description.toString(),
            price: parseInt(price),
            discount: discount ? parseInt(discount) : 0,
            companyId: new ObjectId(companyId),
          });
          // (product.stock = product.stock + parseInt(stock)),
          await product.save();
          responseReturn(res, 201, {
            product,
            message: "Product updated successfully",
          });
        }
      } catch (error) {
        responseReturn(res, 500, { error: "Internal server error" });
      }
    });
  };
  // product_update = async (req, res) => {
  //     let { name, description, discount, price, productId, stock } = req.body;
  //     let { image } = files
  //     const slug = slugify(name.toString(), { replacement: "-", lower: true })
  //     try {
  //         if(1=1){

  //         }else{
  //             const product = await productModel.findByIdAndUpdate(productId, {
  //                 name, description, discount, price, productId, stock, slug
  //             })
  //              responseReturn(res, 200, { product, message: 'Product updated successfully' })
  //         }
  //     } catch (error) {
  //         responseReturn(res, 500, { error: error.message })
  //     }
  // }
  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      const { productId, oldImage } = field;
      const { newImage } = files;
      let filepath = newImage.map((item) => item.filepath);
      let path = filepath.toString();
      let old = oldImage.toString();
      let id = productId.toString();
      if (err) {
        responseReturn(res, 404, { error: err.message });
      } else {
        try {
          const result = await cloudinary.uploader.upload(path, {
            folder: "products",
          });

          if (result) {
            let { images } = await productModel.findById(id);
            const index = images.findIndex((img) => img === old);
            images[index] = result.url;

            await productModel.findByIdAndUpdate(id, {
              images,
            });

            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "product image update success",
            });
          } else {
            responseReturn(res, 404, { error: "image upload failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };

  product_ingredient = async (req, res) => {
    const { id } = req;
    const { cartItems, totalAmount } = req.body;
    const party = await partyModel.find({ accountType: "Inventory" });
    console.log(party[0]);
    const { companyId } = await ownerModel.findById(id);
    const { name } = await ownerModel.findById(id);
    const tempDate = moment(Date.now()).format("ll");
    const UniqueId = Date.now().toString(36).toUpperCase();
    try {
      await transactionModel.create({
        transactionNo: UniqueId,
        companyId: new ObjectId(companyId),
        branchId: new ObjectId(companyId),
        debit: party[0],
        credit: party[0],
        generatedBy: name,
        transactionType: "Conversation",
        description: "Its inventory conversation to finish goods",
        balance: totalAmount,
        date: tempDate,
      });

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const inventory = await inventoryModel.findById(item.id);

        inventory.quantity -= item.quantity;
        inventory.total -= item.amount;
        inventory.price =
          (inventory.total - item.amount) /
          (inventory.quantity - item.quantity);

        await inventory.save({ validateBeforeSave: false });
      }
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new productController();
