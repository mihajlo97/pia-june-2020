const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HOTHOUSE_SPOTS_COLLECTION = "HothouseSpots";
const HOTHOUSES_COLLECTION = "Hothouses";
const SEEDLINGS_COLLECTION = "Seedlings";
const WAREHOUSES_COLLECTION = "Warehouses";
const WAREHOUSE_ITEMS_COLLECTION = "WarehouseItems";

exports.HothouseSpotSchema = new Schema(
  {
    row: {
      type: Number,
      min: 1,
      required: true,
      immutable: true,
    },
    col: {
      type: Number,
      min: 1,
      required: true,
      immutable: true,
    },
    occupied: {
      type: Boolean,
      required: true,
    },
    lastOccupiedOn: {
      type: Date,
      required: false,
    },
  },
  { collection: HOTHOUSE_SPOTS_COLLECTION }
);

exports.HothouseSchema = new Schema(
  {
    //binds to worker username
    owner: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    capacity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    occupiedSpots: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    waterAmount: {
      type: Number,
      required: true,
      default: 200,
      min: 0,
      max: 1000,
    },
    temperature: {
      type: Number,
      required: true,
      default: 18.0,
      min: -20.0,
      max: 50.0,
    },
    conditionsLastUpdatedOn: {
      type: Date,
      required: true,
      default: () => Date.now(),
    },
    spots: [this.HothouseSpotSchema],
  },
  { collection: HOTHOUSES_COLLECTION }
);

exports.SeedlingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    //binds to company username
    manufacturer: {
      type: String,
      required: true,
    },
    hothouse: {
      type: Schema.Types.ObjectId,
      required: true,
      path: HOTHOUSES_COLLECTION,
    },
    row: {
      type: Number,
      min: 1,
      required: true,
    },
    col: {
      type: Number,
      min: 1,
      required: true,
    },
    plantedOn: {
      type: Date,
      required: true,
      immutable: true,
    },
    daysToGrow: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
      immutable: true,
    },
    growthAcceleratedBy: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    done: {
      type: Boolean,
      required: true,
      default: false,
    },
    picked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { collection: SEEDLINGS_COLLECTION }
);

exports.WarehouseItemSchema = new Schema(
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
      immutable: true,
      enum: ["seedling", "fertilizer"],
    },
    daysToGrow: {
      type: Number,
      required: false,
      immutable: true,
    },
    accelerateGrowthBy: {
      type: Number,
      required: false,
      immutable: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { collection: WAREHOUSE_ITEMS_COLLECTION }
);

exports.WarehouseSchema = new Schema(
  {
    hothouse: {
      type: Schema.Types.ObjectId,
      required: true,
      path: HOTHOUSES_COLLECTION,
    },
    items: [this.WarehouseItemSchema],
  },
  { collection: WAREHOUSES_COLLECTION }
);
