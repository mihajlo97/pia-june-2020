const mongoose = require("mongoose");
const Schema = mongoose.Schema;

exports.WorkerInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    birthdate: { type: Date, required: true },
    birthplace: { type: String, required: true },
    cellphone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { collection: "WorkerInfo" }
);

exports.CompanyInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    foundingDate: { type: Date, required: true },
    hq: { type: String, required: true },
    email: { type: String, required: true },
  },
  { collection: "CompanyInfo" }
);

exports.AdminInfoSchema = new Schema(
  {
    email: { type: String, required: true },
  },
  { collection: "AdminInfo" }
);

exports.UserSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "worker", "company"],
    },
    info: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "infoSelector",
    },
    infoSelector: {
      type: String,
      required: true,
      enum: ["AdminInfo", "WorkerInfo", "CompanyInfo"],
    },
  },
  { collection: "Users" }
);
