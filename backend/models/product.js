const mongoose = require("mongoose");
const Schema = mongoose.Schema;

exports.PRODUCTS_COLLECTION = "Products";
exports.PRODUCT_COMMENTS_COLLECTION = "ProductComments";

exports.ProductCommentSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { collection: PRODUCT_COMMENTS_COLLECTION }
);

exports.ProductSchema = new Schema(
  {
    //binds to company username
    manufacturer: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["seedling", "fertilizer"],
    },
    daysToGrow: {
      type: Number,
      required: false,
    },
    accelerateGrowthBy: {
      type: Number,
      required: false,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    comments: [this.ProductCommentSchema],
  },
  { collection: PRODUCTS_COLLECTION }
);
