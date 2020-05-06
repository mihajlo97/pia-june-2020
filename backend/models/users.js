const mongoose = require("mongoose");
const Schema = mongoose.Schema;

exports.WorkerInfoSchema = new Schema({});

exports.UserSchema = new Schema({
  id: Number,
  username: String,
  password: String,
  salt: String,
  role: String,
});
