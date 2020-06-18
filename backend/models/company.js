const mongoose = require("mongoose");
const product = require("./product");
const Schema = mongoose.Schema;

const ORDERS_COLLECTION = "Orders";
const ORDER_ITEMS_COLLECTION = "OrderItems";
const DELIVERY_AGENTS_COLLECTION = "DeliveryAgents";

exports.OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      path: product.PRODUCTS_COLLECTION_KEY,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { collection: ORDER_ITEMS_COLLECTION }
);

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
    products: [this.OrderItemSchema],
    accepted: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
    },
  },
  { collection: ORDERS_COLLECTION }
);

exports.DeliveryAgentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      required: true,
      path: ORDERS_COLLECTION,
    },
    //binds to worker's hothouse location
    deliverTo: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    available: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { collection: DELIVERY_AGENTS_COLLECTION }
);
