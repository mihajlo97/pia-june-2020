const mongoose = require("mongoose");
const { UserSchema, AdminInfoSchema } = require("../models/users");
const bcrypt = require("bcrypt");

const Users = mongoose.model("User", UserSchema);
const AdminInfo = mongoose.model("AdminInfo", AdminInfoSchema);

exports.addMasterAdmin = async (req, res) => {
  await AdminInfo.create({
    email: "master@admin.com",
  });
  const _id = await AdminInfo.findOne({
    email: "master@admin.com",
  })
    .select("_id")
    .exec();
  const saltValue = await bcrypt.genSalt();
  const pass = "Admin#PIA2020";
  const hashedPassword = await bcrypt.hash(pass, saltValue);
  const doc = await Users.create({
    username: "admin",
    password: hashedPassword,
    salt: saltValue,
    role: "admin",
    info: _id,
    infoSelector: "AdminInfo",
  });
  console.log("[TEST]: Added master admin successfully.");
  res.json(doc);
};
