const mongoose = require("mongoose");
const worker = require("../models/worker");
const users = require("../models/users");

const WATER_DEFAULT = 200;
const TEMPERATURE_DEFAULT = 18.0;

//[DB-COLLECTIONS]
const Hothouse = mongoose.model("Hothouses", worker.HothouseSchema);
const HothouseSpot = mongoose.model("HothouseSpots", worker.HothouseSpotSchema);
const Seedling = mongoose.model("Seedlings", worker.SeedlingSchema);
const Warehouse = mongoose.model("Warehouses", worker.WarehouseSchema);
const WarehouseItem = mongoose.model(
  "WarehouseItems",
  worker.WarehouseItemSchema
);
const Users = mongoose.model("Users", users.UserSchema);

//[MIDDLEWARE]
exports.checkWorkerPermission = async (req, res, next) => {
  let response = {
    error:
      "Insufficient-Permission-Exception: This user does not have permission to make this request.",
  };
  if (req.session && req.session.username) {
    const user = await Users.findOne({
      username: req.session.username,
      role: "worker",
    }).exec();

    if (user) {
      next();
    } else {
      console.info(
        "[MIDWARE][RES]: @worker: checkWorkerPermission\nMidware-Result: 403.\nResult-Origin: Username lookup.\nResponse:\n",
        response
      );
      return res.status(403).json(response);
    }
  } else {
    console.info(
      "[MIDWARE][RES]: @worker: checkWorkerPermission\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(403).json(response);
  }
};

//[API]

//POST @api/worker/hothouse/create
exports.createHothouse = async (req, res) => {
  let response = { success: false };

  //handle bad request
  if (
    !req.body.username ||
    !req.body.name ||
    !req.body.location ||
    !req.body.width ||
    !req.body.height
  ) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/create\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  const capacity = req.body.width * req.body.height;

  let hothouse = new Hothouse();

  hothouse.owner = req.body.username;
  hothouse.name = req.body.name;
  hothouse.location = req.body.location;
  hothouse.width = req.body.width;
  hothouse.height = req.body.height;
  hothouse.capacity = capacity;
  hothouse.occupiedSpots = 0;
  hothouse.waterAmount = WATER_DEFAULT;
  hothouse.temperature = TEMPERATURE_DEFAULT;
  hothouse.conditionsLastUpdatedOn = new Date();

  let rowCounter = 0;
  for (let i = 0; i < capacity; i++) {
    if (i % req.body.width === 0) {
      rowCounter++;
    }
    hothouse.spots.push({
      row: rowCounter,
      col: (i % req.body.width) + 1,
      occupied: false,
      lastOccupiedOn: null,
    });
  }

  hothouse
    .save()
    .then((doc) => {
      if (doc) {
        let warehouse = new Warehouse();

        warehouse.hothouse = doc._id;
        warehouse.items = [];

        warehouse
          .save()
          .then((doc) => {
            if (doc) {
              response.success = true;
              console.info(
                "[POST][RES]: @api/worker/hothouse/create\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
                response
              );
              return res.status(200).json(response);
            }
          })
          .catch((err) => {
            console.error(
              "[ERROR][DB]: @api/worker/hothouse/create\nDatabase-Query-Exception: Query call failed.\nQuery: Create warehouse.\nError-Log:\n",
              err
            );
            return res.status(500).json(response);
          });
      }
    })
    .catch((err) => {
      console.error(
        "[ERROR][DB]: @api/worker/hothouse/create\nDatabase-Query-Exception: Query call failed.\nQuery: Create hothouse.\nError-Log:\n",
        err
      );
      return res.status(500).json(response);
    });
};

//GET @api/worker/hothouse
exports.getHothouses = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");

  let hothouseItem = {
    _id: "",
    name: "",
    location: "",
    capacity: 0,
    occupiedSpots: 0,
    waterAmount: 0,
    temperature: 0,
  };

  try {
    let cursor = Hothouse.find({
      owner: req.session.username,
    }).cursor();
    let doc = await cursor.next();
    let docNext;

    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        hothouseItem._id = doc._id;
        hothouseItem.name = doc.name;
        hothouseItem.location = doc.location;
        hothouseItem.capacity = doc.capacity;
        hothouseItem.occupiedSpots = doc.occupiedSpots;
        hothouseItem.waterAmount = doc.waterAmount;
        hothouseItem.temperature = doc.temperature;
        res.write(JSON.stringify(hothouseItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[GET][RES]: @api/worker/hothouse\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );
    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/hothouse\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving hothouses.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @@api/worker/hothouse/warehouse
exports.getWarehouse = async (req, res) => {
  let response = [];
  //handle bad request
  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    const warehouse = await Warehouse.findOne({
      hothouse: req.body._id,
    }).exec();
    response = warehouse.items;
    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/hothouse/warehouse\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving warehouse.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/worker/hothouse/warehouse/filter
exports.filterWarehouse = async (req, res) => {
  let response = [];
  //handle bad request
  if (
    !req.body._id ||
    req.body.search === null ||
    req.body.search === undefined ||
    !req.body.category ||
    !req.body.sort ||
    !req.body.order
  ) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse/filter\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    const warehouse = await Warehouse.findOne({
      hothouse: req.body._id,
    }).exec();

    response = warehouse.items
      .filter((item) => {
        if (req.body.search === "") {
          return true;
        }

        switch (req.body.category) {
          case "name": {
            return item.name.toLowerCase().includes(req.body.search);
          }
          case "manufacturer": {
            return item.manufacturer.toLowerCase().includes(req.body.search);
          }
          case "quantity": {
            return item.quantity >= parseInt(req.body.search);
          }
          default: {
            return false;
          }
        }
      })
      .sort((a, b) => {
        switch (req.body.sort) {
          case "name": {
            if (req.body.order === "desc") {
              return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1;
            } else {
              return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
            }
          }
          case "manufacturer": {
            if (req.body.order === "desc") {
              return a.manufacturer.toLowerCase() > b.manufacturer.toLowerCase()
                ? -1
                : 1;
            } else {
              return a.manufacturer.toLowerCase() > b.manufacturer.toLowerCase()
                ? 1
                : -1;
            }
          }
          case "quantity": {
            if (req.body.order === "desc") {
              return a.quantity > b.quantity ? -1 : 1;
            } else {
              return a.quantity > b.quantity ? 1 : -1;
            }
          }
          default: {
            return -1;
          }
        }
      });

    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse/filter\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/hothouse/warehouse/filter\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving warehouse.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/worker/hothouse/dashboard
exports.getHothouseDashboardData = async (req, res) => {
  let response = {};
  //handle bad request
  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/dashboard\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    //fetch data from database
    const hothouse = await Hothouse.findById(req.body._id).exec();
    if (!hothouse) {
      throw new Error("Item-Not-Found-Exception: Hothouse.");
    }
    const warehouse = await Warehouse.findOne({
      hothouse: req.body._id,
    }).exec();
    if (!warehouse) {
      throw new Error("Item-Not-Found-Exception: Warehouse.");
    }
    const seedlings = await Seedling.find({
      hothouse: req.body._id,
      picked: false,
    }).exec();

    //structure response
    response.hothouseControl = {
      capacity: hothouse.capacity,
      occupiedSpots: hothouse.occupiedSpots,
      waterAmount: hothouse.waterAmount,
      temperature: hothouse.temperature,
      conditionsLastUpdatedOn: hothouse.conditionsLastUpdatedOn,
    };
    response.hothouseSpots = hothouse.spots;
    response.warehouseItems = warehouse.items;
    response.seedlings = seedlings;

    console.info(
      "[POST][RES]: @api/worker/hothouse/dashboard\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/hothouse/dashboard\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving dashboard data.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/worker/hothouse/seedling
exports.createSeedling = async (req, res) => {
  let response = { success: false };
  //handle bad request
  if (!req.body.seedling) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/seedling\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    //check hothouse requirements for a new seedling
    const hothouse = await Hothouse.findById(req.body.seedling.hothouse).exec();
    if (!hothouse) {
      throw new Error("Item-Not-Found-Exception: Hothouse.");
    }
    if (hothouse.occupiedSpots >= hothouse.capacity) {
      throw new Error(
        "Out-Of-Bounds-Value-Exception: Cannot exceed hothouse capacity."
      );
    }
    if (
      req.body.seedling.row > hothouse.height ||
      req.body.seedling.col > hothouse.width ||
      req.body.seedling.row < 1 ||
      req.body.seedling.col < 1
    ) {
      throw new Error(
        "Out-Of-Bounds-Value-Exception: Cannot exceed hothouse dimensions."
      );
    }

    //create new seedling
    const seedling = await Seedling.create({
      name: req.body.seedling.name,
      manufacturer: req.body.seedling.manufacturer,
      hothouse: hothouse._id,
      row: req.body.seedling.row,
      col: req.body.seedling.col,
      plantedOn: new Date(),
      daysToGrow: req.body.seedling.daysToGrow,
      done: false,
      picked: false,
    });
    if (!seedling) {
      throw new Error("Item-Not-Found-Exception: Seedling.");
    }

    //update hothouse spot
    const index = hothouse.spots.findIndex(
      (spot) =>
        spot.row === req.body.seedling.row && spot.col === req.body.seedling.col
    );
    if (index < 0) {
      throw new Error("Item-Not-Found-Exception: Hothouse.spots.");
    }
    hothouse.spots[index].occupied = true;
    hothouse.spots[index].lastOccupiedOn = null;
    const doc = await hothouse.save();
    if (!doc) {
      throw new Error("On-Save-Exception: Failed to save the document.");
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/worker/hothouse/seedling\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/hothouse/seedling\nDatabase-Query-Exception: Query call failed.\nQuery: Creating seedling.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/worker/hothouse/warehouse/update
exports.updateWarehouseItem = async (req, res) => {
  let response = { success: false };

  //handle bad request
  if (!req.body._id || !req.body.hothouse || !req.body.quantity) {
    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse/update\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    //fetch warehouse
    const warehouse = await Warehouse.findOne({
      hothouse: req.body.hothouse,
    }).exec();
    if (!warehouse) {
      throw new Error("Item-Not-Found-Exception: Warehouse.");
    }

    //update warehouse
    const index = warehouse.items.findIndex((item) => item._id == req.body._id);
    if (index < 0) {
      throw new Error("Item-Not-Found-Exception: Warehouse.items");
    }
    if (req.body.quantity < 0) {
      throw new Error(
        "Out-Of-Bounds-Value-Exception: Quantity must be nonnegative."
      );
    }
    warehouse.items[index].quantity = req.body.quantity;

    const doc = await warehouse.save();
    if (!doc) {
      throw new Error("On-Save-Exception: Failed to save the document.");
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/worker/hothouse/warehouse/update\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/worker/warehouse/update\nDatabase-Query-Exception: Query call failed.\nQuery: Updating warehouse item.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};
