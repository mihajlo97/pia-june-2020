const mongoose = require("mongoose");
const product = require("./product");
const Schema = mongoose.Schema;

const ORDERS_COLLECTION = "Orders";
const COURIER_COLLECTION = "Couriers";

exports.OrderSchema = new Schema(
  {
    //binds to company username
    manufacturer: {
      type: String,
      required: true,
    },
    //binds to worker username
    orderedBy: {
      type: String,
      required: true,
    },
    orderedOn: {
      type: Date,
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: product.PRODUCTS_COLLECTION_KEY,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    groupOrderId: {
      type: String,
      required: true,
    },
    accepted: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
    },
    //binds to worker's warehouse
    destinationId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    deliverTo: {
      type: String,
      required: true,
    },
  },
  { collection: ORDERS_COLLECTION }
);

exports.CourierSchema = new Schema(
  {
    //binds to company username
    registeredTo: {
      type: String,
      required: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: ORDERS_COLLECTION,
      },
    ],
    deliveryDate: {
      type: Date,
      required: false,
    },
    returnDate: {
      type: Date,
      required: false,
    },
    available: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["idle", "delivering", "returning"],
    },
  },
  { collection: COURIER_COLLECTION }
);
