const branchModel = require("../../models/branchModel");
const companyModel = require("../../models/companyModel");
const { responseReturn } = require("../../utils/response");
const { formidable } = require("formidable");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const {
  mongo: { ObjectId },
} = require("mongoose");

class companyController {
  add_company = async (req, res) => {
    try {
      const { name, email, address, mobile, description, status, image } =
        req.body;
      if (!image || !name || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches)
        return res.status(400).json({ error: "Invalid image format" });

      const ext = matches[1].split("/")[1];
      const base64Data = matches[2];
      const fileName = `img-${Date.now()}.${ext}`;

      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const filePath = path.join("uploads", fileName);
      fs.writeFileSync(filePath, base64Data, "base64");

      const newEntry = new companyModel({
        name,
        email,
        address,
        mobile,
        description,
        status,
        image: `/uploads/${fileName}`,
      });

      const company = await newEntry.save();
      responseReturn(res, 201, {
        company,
        message: "Company added successfully",
      });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_company = async (req, res) => {
    try {
      const {
        name,
        email,
        address,
        mobile,
        description,
        status,
        image,
        companyId,
      } = req.body;
      if (image) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches)
          return res.status(400).json({ error: "Invalid image format" });

        const ext = matches[1].split("/")[1];
        const base64Data = matches[2];
        const fileName = `img-${Date.now()}.${ext}`;

        const uploadDir = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
        fs.writeFileSync(filePath, base64Data, "base64");

        const updatingCompany = await companyModel.findById(companyId);
        console.log(updatingCompany?.image);
        if (updatingCompany?.image) {
          const oldImageRelativePath = updatingCompany.image.startsWith("/")
            ? updatingCompany.image.slice(1)
            : updatingCompany.image;

          const oldPath = path.join(
            __dirname,
            "..",
            "..",
            oldImageRelativePath
          );

          console.log("Deleting image at:", oldPath); // ✅ Log this

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log("✅ Image deleted.");
          } else {
            console.log("❌ File not found at:", oldPath);
          }
        }
        const company = await companyModel.findByIdAndUpdate(companyId, {
          name,
          email,
          address,
          mobile,
          description,
          status,
          image: `/uploads/${fileName}`,
        });

        responseReturn(res, 201, {
          company,
          message: "Company updated successfully",
        });
      } else {
        const company = await companyModel.findByIdAndUpdate(companyId, {
          name,
          email,
          address,
          mobile,
          description,
          status,
        });

        responseReturn(res, 201, {
          company,
          message: "Company updated successfully",
        });
      }
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_company = async (req, res) => {
    try {
      const companies = await companyModel.find({}).sort({ createdAt: -1 });
      const totalCompany = await companyModel.find({}).countDocuments();
      responseReturn(res, 201, {
        companies,
        totalCompany,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  set_status = async (req, res) => {
    const { status, companyId } = req.body;

    try {
      await companyModel.findByIdAndUpdate(companyId, {
        status,
      });
      const company = await companyModel.findById(companyId);
      responseReturn(res, 201, {
        company,
        message: "Company status updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_a_company = async (req, res) => {
    const { companyId } = req.params;
    try {
      const company = await companyModel.findById(companyId);
      responseReturn(res, 201, { company });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  add_branch = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let { name, address, email, mobile, description, company } = field;
      const slug = slugify(name.toString(), { replacement: "-", lower: true });

      try {
        const branch = await branchModel.create({
          name: name.toString(),
          slug,
          address: address.toString(),
          email: email.toString(),
          mobile: mobile.toString(),
          description: description.toString(),
          companyId: company.toString(),
        });
        responseReturn(res, 201, { message: "Branch added successfully" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  get_branch = async (req, res) => {
    const { page, searchValue, parPage, status } = req.query;
    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && status && page && parPage) {
        const branches = await branchModel
          .find({
            $text: { $search: searchValue },
            status: status,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 })
          .populate("companyId");
        //console.log(branches)
        const totalBranch = await branchModel
          .find({
            $text: { $search: searchValue },
            status: status,
          })
          .countDocuments();
        //console.log(totalBranch)
        responseReturn(res, 200, { totalBranch, branches });
      } else if (searchValue && status === "" && page && parPage) {
        const branches = await branchModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ updatedAt: -1 })
          .populate("companyId");
        //console.log(branches)
        const totalBranch = await branchModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        //console.log(totalBranch)
        responseReturn(res, 200, { totalBranch, branches });
      } else if (searchValue === "" && status && page && parPage) {
        const branches = await branchModel
          .find({ status: status })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
          .populate("companyId");
        const totalBranch = await branchModel
          .find({ status: status })
          .countDocuments();
        responseReturn(res, 200, { totalBranch, branches });
      } else if (searchValue === "" && status === "" && page && parPage) {
        const branches = await branchModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
          .populate("companyId");
        const totalBranch = await branchModel.find({}).countDocuments();
        responseReturn(res, 200, { totalBranch, branches });
      } else {
        const branches = await companyModel
          .find({})
          .sort({ createdAt: -1 })
          .populate("companyId");
        const totalBranch = await companyModel.find({}).countDocuments();
        responseReturn(res, 200, { totalBranch, branches });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_company_branch = async (req, res) => {
    const { companyId } = req.params;
    try {
      const companyBranch = await branchModel
        .find({ companyId: companyId })
        .populate("companyId");
      const totalCompanyBranch = await branchModel
        .find({ companyId: companyId })
        .countDocuments();
      responseReturn(res, 201, { companyBranch, totalCompanyBranch });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  set_branch_status = async (req, res) => {
    const { status, branchId } = req.body;

    try {
      await branchModel.findByIdAndUpdate(branchId, {
        status,
      });
      const branch = await branchModel.findById(branchId);
      responseReturn(res, 201, {
        branch,
        message: "Company status updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  update_branch = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let { name, address, email, mobile, description, company, id } = field;
      const branchId = id.toString();
      const companyId = company.toString();
      const slug = slugify(name.toString(), { replacement: "-", lower: true });

      try {
        if (companyId === "") {
          const branch = await branchModel.findByIdAndUpdate(branchId, {
            name: name.toString(),
            slug,
            address: address.toString(),
            email: email.toString(),
            mobile: mobile.toString(),
            description: description.toString(),
          });
          responseReturn(res, 201, {
            branch,
            message: "Branch updated successfully",
          });
        } else {
          const branch = await branchModel.findByIdAndUpdate(branchId, {
            name: name.toString(),
            slug,
            address: address.toString(),
            email: email.toString(),
            mobile: mobile.toString(),
            description: description.toString(),
            companyId: companyId,
          });
          responseReturn(res, 201, {
            branch,
            message: "Branch updated successfully",
          });
        }
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  get_a_branch = async (req, res) => {
    const { branchId } = req.params;
    try {
      const branch = await branchModel.findById(branchId).populate("companyId");
      responseReturn(res, 201, { branch });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}
module.exports = new companyController();
