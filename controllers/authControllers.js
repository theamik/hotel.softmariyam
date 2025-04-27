const superAdminModel = require("../models/superAdminModel");
const ownerModel = require("../models/ownerModel");
const staffModel = require("../models/staffModel");
const bcrypt = require("bcrypt");
const { responseReturn } = require("../utils/response");
const jwt = require("jsonwebtoken");
const { createToken } = require("../utils/tokenCreate");
const cloudinary = require("../utils/cloudinaryConfig");
const { formidable } = require("formidable");
const ownerAdminModel = require("../models/chat/ownerAdminModel");
const staffOwnerModel = require("../models/chat/staffOwnerModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const branchModel = require("../models/branchModel");
const companyModel = require("../models/companyModel");

class authControllers {
  super_admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const superadmin = await superAdminModel
        .findOne({ email })
        .select("+password");
      if (superadmin) {
        const match = await bcrypt.compare(password, superadmin.password);
        if (match) {
          const token = await createToken({
            id: superadmin.id,
            role: superadmin.role,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            secure: true,
            httpOnly: true,
            sameSite: "none",
          });
          responseReturn(res, 200, { token, message: "Logged In !" });
        } else {
          responseReturn(res, 404, { error: "Password Incorrect" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  owner_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await ownerModel.findOne({ email }).select("+password");
      if (admin) {
        if (admin.status !== "active") {
          responseReturn(res, 404, { error: "Your account is not active!" });
        }
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
          const token = await createToken({
            id: admin.id,
            role: admin.role,
            userInfo: admin,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            secure: true,
            httpOnly: true,
            sameSite: "none",
          });
          responseReturn(res, 200, { token, message: "Logged In !" });
        } else {
          responseReturn(res, 404, { error: "Password Incorrect" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  owner_register = async (req, res) => {
    const { email, name, password, mobile, position, role, status } = req.body;

    try {
      const getUser = await ownerModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: "Email alrady exit" });
      } else {
        const owner = await ownerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          mobile: mobile ? mobile : "No number given",
          role: role ? role : "hotel",
          status: status ? status : "pending",
          position,
        });
        const token = await createToken({ id: owner.id, role: owner.role });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
        responseReturn(res, 201, {
          token,
          userInfo: owner,
          message: "Register success",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_owner = async (req, res) => {
    const { email, name, password, mobile, position, role, status, userId } =
      req.body;

    let Id = userId;

    if (!status) {
      responseReturn(res, 404, { error: "Please select user status!" });
    } else if (!role) {
      responseReturn(res, 404, { error: "Please select user role!" });
    } else {
      try {
        if (password) {
          const user = await ownerModel.findByIdAndUpdate(Id, {
            name,
            email,
            mobile: mobile ? mobile : "No number given",
            role: role ? role : "hotel",
            status: status ? status : "pending",
            position,
            password: await bcrypt.hash(password, 10),
          });
          responseReturn(res, 201, {
            user,
            message: "User updated successfully",
          });
        } else {
          const user = await ownerModel.findByIdAndUpdate(Id, {
            name,
            email,
            mobile: mobile ? mobile : "No number given",
            role: role ? role : "hotel",
            status: status ? status : "pending",
            position,
          });
          responseReturn(res, 201, {
            user,
            message: "User updated successfully",
          });
        }
      } catch (error) {
        responseReturn(res, 500, { error: "Internal server error" });
      }
    }
  };
  staff_login = async (req, res) => {
    const { email, password } = req.body;
    console.log("first");
    try {
      const staff = await staffModel.findOne({ email }).select("+password");
      if (staff) {
        const match = await bcrypt.compare(password, staff.password);
        if (match) {
          const token = await createToken({
            id: staff.id,
            role: staff.role,
            userInfo: staff,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            secure: true,
            httpOnly: true,
            sameSite: "none",
          });
          responseReturn(res, 200, { token, message: "Login success" });
        } else {
          responseReturn(res, 404, { error: "Password wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  staff_register = async (req, res) => {
    const { email, name, password, mobile_no } = req.body;
    try {
      const getUser = await staffModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: "Email alrady exit" });
      } else {
        const staff = await staffModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          note: mobile_no,
        });
        await staffOwnerModel.create({
          myId: staff.id,
        });
        const token = await createToken({ id: staff.id, role: staff.role });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
        responseReturn(res, 201, {
          token,
          userInfo: staff,
          message: "Register successful",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  getUser = async (req, res) => {
    const { id, role } = req;

    try {
      const owner = await ownerModel.findById(id).populate("companyId");
      responseReturn(res, 200, { userInfo: owner });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_a_user = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await ownerModel.findById(userId);
      responseReturn(res, 200, { user });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  allUsers = async (req, res) => {
    const { id, role } = req;

    try {
      const users = await ownerModel.find({}).sort({ name: 1 });
      responseReturn(res, 200, { users });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, _, files) => {
      const { image } = files;
      let filepath = image.map((item) => item.filepath);
      let path = filepath.toString();
      try {
        const result = await cloudinary.uploader.upload(path, {
          folder: "foodaleeza/profile",
        });
        const staff = await staffModel.findById(id);
        const owner = await ownerModel.findById(id);
        if (result) {
          if (staff) {
            staff.image = result.url;

            await staff.save();

            const userInfo = staff;
            responseReturn(res, 201, {
              message: "Image upload success",
              userInfo,
            });
          } else if (owner) {
            owner.image = result.url;

            await owner.save();

            const userInfo = owner;
            responseReturn(res, 201, {
              message: "Image upload success",
              userInfo,
            });
          } else {
            responseReturn(res, 404, { error: "User Not Found" });
          }
        } else {
          responseReturn(res, 404, { error: "image upload failed" });
        }
      } catch (error) {
        //console.log(error)
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  profile_info_add = async (req, res) => {
    const {
      division,
      district,
      sub_district,
      post_code,
      police_station,
      description,
      address,
    } = req.body;
    const { id, role } = req;

    if (role === "staff") {
      var { companyId } = await staffModel.findById(id);
      var { branchId } = await staffModel.findById(id);
    } else {
      var { companyId } = await ownerModel.findById(id);
    }
    try {
      if (role === "staff") {
        const branch = await branchModel.findByIdAndUpdate(branchId, {
          address: address,
          description: description,
          division: division,
          district: district,
          sub_district: sub_district,
          post_code: post_code,
          police_station: police_station,
        });
        const userInfo = await staffModel.findById(id);
        responseReturn(res, 201, {
          message: "Profile info add success",
          userInfo,
        });
      } else {
        const company = await companyModel.findByIdAndUpdate(companyId, {
          address: address,
          description: description,
          division: division,
          district: district,
          sub_district: sub_district,
          post_code: post_code,
          police_station: police_station,
        });
        const userInfo = await ownerModel.findById(id);
        responseReturn(res, 201, {
          message: "Profile info add success",
          userInfo,
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  logout = async (req, res) => {
    try {
      res.cookie("accessToken", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      responseReturn(res, 200, { message: "logout success" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  // Forgot Password
  forgot_password = async (req, res, next) => {
    const staff = await staffModel.findOne({ email: req.body.email });
    const owner = await ownerModel.findOne({ email: req.body.email });

    try {
      if (staff) {
        // Get ResetPassword Token
        const resetToken = staff.getResetToken();

        await staff.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/password/${resetToken}`;

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

        try {
          await sendEmail({
            email: staff.email,
            subject: `Password Recovery`,
            message,
          });

          responseReturn(res, 201, {
            message: "Check your mail for recover password",
          });
        } catch (error) {
          staff.resetPasswordToken = undefined;
          staff.resetPasswordExpire = undefined;

          await staff.save({ validateBeforeSave: false });
          responseReturn(res, 500, { error: error.message });
        }
      } else if (owner) {
        // Get ResetPassword Token
        const resetToken = owner.getResetToken();

        await owner.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/password/${resetToken}`;

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

        try {
          await sendEmail({
            email: owner.email,
            subject: `Password Recovery`,
            message,
          });

          responseReturn(res, 201, {
            message: `Email sent to ${owner.email} successfully`,
          });
        } catch (error) {
          owner.resetPasswordToken = undefined;
          owner.resetPasswordExpire = undefined;

          await owner.save({ validateBeforeSave: false });

          responseReturn(res, 500, { error: error.message });
        }
      } else {
        responseReturn(res, 400, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Email not found" });
    }
  };
  reset_password = async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");

    const staff = await staffModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    const owner = await ownerModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    try {
      if (staff) {
        staff.password = await bcrypt.hash(req.body.password, 10);
        staff.resetPasswordToken = undefined;
        staff.resetPasswordExpire = undefined;

        await staff.save();

        const token = await createToken({
          id: staff.id,
          role: staff.role,
          userInfo: staff,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
        responseReturn(res, 200, {
          token,
          message: "Password Reset Successfully",
        });
      } else if (owner) {
        owner.password = await bcrypt.hash(req.body.password, 10);
        owner.resetPasswordToken = undefined;
        owner.resetPasswordExpire = undefined;

        await owner.save();

        const token = await createToken({
          id: owner.id,
          role: owner.role,
          userInfo: owner,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
        responseReturn(res, 200, {
          token,
          message: "Password Reset Successfully",
        });
      } else {
        responseReturn(res, 400, {
          error: "Reset Password Token is invalid or has been expired",
        });
      }
    } catch (error) {
      responseReturn(res, 500, {
        error: "Reset Password Token is invalid or has been expired",
      });
    }
  };

  change_password = async (req, res, next) => {
    // creating token hash
    const { id } = req;

    try {
      const staff = await staffModel.findById(id).select("+password");
      const owner = await ownerModel.findById(id).select("+password");
      if (staff) {
        const match = await bcrypt.compare(
          req.body.old_password,
          staff.password
        );
        if (!match) {
          responseReturn(res, 404, { error: "Old password wrong" });
        } else {
          staff.password = await bcrypt.hash(req.body.password, 10);

          await staff.save();

          responseReturn(res, 200, {
            message: "Password Changed Successfully",
          });
        }
      } else if (owner) {
        const match = await bcrypt.compare(
          req.body.old_password,
          owner.password
        );
        if (!match) {
          responseReturn(res, 404, { error: "Old password wrong" });
        } else {
          owner.password = await bcrypt.hash(req.body.password, 10);

          await owner.save();

          responseReturn(res, 200, {
            message: "Password Changed Successfully",
          });
        }
      } else {
        responseReturn(res, 404, { error: "User Not Found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new authControllers();
