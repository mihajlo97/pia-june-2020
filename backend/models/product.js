const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PRODUCTS_COLLECTION = "Products";
const PRODUCT_COMMENTS_COLLECTION = "ProductComments";

exports.PRODUCTS_COLLECTION_KEY = PRODUCTS_COLLECTION;
exports.PRODUCT_COMMENTS_COLLECTION_KEY = PRODUCT_COMMENTS_COLLECTION;

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
    commentedOn: {
      type: Date,
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
