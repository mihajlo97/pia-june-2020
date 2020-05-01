const mongoose = require("mongoose");
const Schema = mongoose.Schema;

exports.WorkerRegistrationRequestSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  birthdate: { type: Date, required: true },
  birthplace: { type: String, required: true },
  cellphone: { type: String, required: true },
  email: { type: String, required: true },
});