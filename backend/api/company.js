const mongoose = require("mongoose");
const request = require("request-promise-native");
const product = require("../models/product");
const company = require("../models/company");
const worker = require("../models/worker");
const users = require("../models/users");

const MAX_COURIER_COUNT = 5;
const TOM_TOM_API_KEY = "VPyWi85fBJw0vT6Gf9bXffg1BAjKVSrh";
const SEARCH_API = "https://api.tomtom.com/search/2/geocode";
const ROUTING_API = "https://api.tomtom.com/routing/1/calculateRoute";

//[DB-COLLECTIONS]
const Product = mongoose.model("Products", product.ProductSchema);
const ProductComment = mongoose.model(
  "ProductComments",
  product.ProductCommentSchema
);
const Order = mongoose.model("Orders", company.OrderSchema);
const Courier = mongoose.model("Couriers", company.CourierSchema);
const Users = mongoose.model("Users", users.UserSchema);
const Warehouse = mongoose.model("Warehouses", worker.WarehouseSchema);
const WarehouseItem = mongoose.model(
  "WarehouseItems",
  worker.WarehouseItemSchema
);

//[MIDDLEWARE]
exports.checkCompanyPermission = async (req, res, next) => {
  let response = {
    error:
      "Insufficient-Permission-Exception: This user does not have permission to make this request.",
  };
  if (req.session && req.session.username) {
    const user = await Users.findOne({
      username: req.session.username,
      role: "company",
    }).exec();

    if (user) {
      next();
    } else {
      console.info(
        "[MIDWARE][RES]: @company: checkCompanyPermission\nMidware-Result: 403.\nResult-Origin: Username lookup.\nResponse:\n",
        response
      );
      return res.status(403).json(response);
    }
  } else {
    console.info(
      "[MIDWARE][RES]: @company: checkCompanyPermission\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(403).json(response);
  }
};

// [API]

//GET @api/company/catalog
exports.getCompanyCatalog = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");

  let catalogItem = {};

  try {
    let cursor = Product.find({
      manufacturer: req.session.username,
    })
      .collation({ locale: "en" })
      .sort("name")
      .cursor();
    let doc = await cursor.next();
    let docNext;

    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        catalogItem._id = doc._id;
        catalogItem.name = doc.name;
        catalogItem.quantity = doc.quantity;
        catalogItem.available = doc.available;
        res.write(JSON.stringify(catalogItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[GET][RES]: @api/company/catalog\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );
    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/catalog\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving company products.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @api/company/catalog/product
exports.getProduct = async (req, res) => {
  let response = { product: null };

  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/company/catalog/product\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    const doc = await Product.findById(req.body._id).exec();
    if (!doc) {
      throw new Error("Item-Not-Found-Exception: Product.");
    }

    response.product = doc;
    console.info(
      "[POST][RES]: @api/company/catalog/product\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/catalog/product\nDatabase-Query-Exception: Query call failed.\nQuery: Fetching product.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/company/catalog/product/availability
exports.toggleProductAvailability = async (req, res) => {
  if (
    !req.body._id ||
    req.body.available === undefined ||
    req.body.available === null
  ) {
    console.info(
      "[POST][RES]: @api/company/catalog/product/availability\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).end();
  }

  try {
    const doc = await Product.findById(req.body._id).exec();
    if (!doc) {
      throw new Error("Item-Not-Found-Exception: Product.");
    }

    doc.available = req.body.available;
    const saved = await doc.save();
    if (!saved) {
      throw new Error("On-Save-Exception: Failed to save the document.");
    }

    console.info(
      "[POST][RES]: @api/company/catalog/product/availability\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nUpdated:\n",
      { availability: req.body.available }
    );
    return res.status(200).end();
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/catalog/product/availability\nDatabase-Query-Exception: Query call failed.\nQuery: Updating product.\nError-Log:\n",
      err
    );
    res.status(500).end();
  }
};

//POST @api/company/catalog/add
exports.addProduct = async (req, res) => {
  let response = { success: false };

  if (!req.body.product) {
    console.info(
      "[POST][RES]: @api/company/catalog/add\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    if (
      req.body.product.manufacturer === "" ||
      req.body.product.name === "" ||
      (req.body.product.type !== "seedling" &&
        req.body.product.type !== "fertilizer") ||
      req.body.product.unitPrice < 0 ||
      (req.body.product.available !== true &&
        req.body.product.available !== false) ||
      req.body.product.quantity < 0
    ) {
      throw new Error("Invalid-Field-Value-Exception: req.body.product");
    }

    let product = {
      manufacturer: req.body.product.manufacturer,
      name: req.body.product.name,
      type: req.body.product.type,
      unitPrice: req.body.product.unitPrice,
      available: req.body.product.available,
      quantity: req.body.product.quantity,
      comments: [],
    };

    if ("daysToGrow" in req.body.product) {
      if (req.body.product.daysToGrow < 1) {
        throw new Error("Invalid-Field-Value-Exception: req.body.product");
      }
      product.daysToGrow = req.body.product.daysToGrow;
    }
    if ("accelerateGrowthBy" in req.body.product) {
      if (req.body.product.accelerateGrowthBy < 1) {
        throw new Error("Invalid-Field-Value-Exception: req.body.product");
      }
      product.accelerateGrowthBy = req.body.product.accelerateGrowthBy;
    }

    const doc = await Product.create(product);
    if (!doc) {
      throw new Error("On-Save-Exception: Failed to save the document.");
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/company/catalog/add\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/catalog/add\nDatabase-Query-Exception: Query call failed.\nQuery: Adding new product to products.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//GET @api/company/analytics
exports.getAnalytics = async (req, res) => {
  let response = { data: [] };

  const day = 1000 * 60 * 60 * 24;
  const now = new Date().getTime();
  const daysAgo = 30;

  const lowerBound = new Date(now - (daysAgo - 1) * day);
  const lowerBoundRounded = new Date(
    lowerBound.getFullYear(),
    lowerBound.getMonth(),
    lowerBound.getDate(),
    0,
    0,
    0,
    0
  );

  //populate data set with default values
  for (let i = 0; i < daysAgo; i++) {
    response.data.push({
      date: new Date(lowerBound.getTime() + i * day),
      orders: 0,
    });
  }

  try {
    const docs = await Order.find()
      .where("manufacturer")
      .equals(req.session.username)
      .where("orderedOn")
      .gte(lowerBoundRounded)
      .select("orderedOn")
      .sort("orderedOn")
      .exec();

    if (!docs || docs === []) {
      console.info(
        "[GET][RES]: @api/company/analytics\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
        response
      );
      res.status(200).json(response);
    }

    //populate data set with actual data
    for (let i = 0; i < daysAgo - 1; i++) {
      const matching = docs.filter(
        (doc) =>
          doc.orderedOn.getTime() >= response.data[i].date.getTime() &&
          doc.orderedOn.getTime() < response.data[i + 1].date.getTime()
      );
      response.data[i].orders = matching.length;
    }
    const matching = docs.filter(
      (doc) =>
        doc.orderedOn.getTime() >= response.data[daysAgo - 1].date.getTime()
    );
    response.data[daysAgo - 1].orders = matching.length;

    console.info(
      "[GET][RES]: @api/company/analytics\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/analytics\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving company orders.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/company/orders
exports.getOrdersBacklog = async (req, res) => {
  let response = { entries: [] };

  if (
    !req.body.sort ||
    (req.body.sort !== "ascending" && req.body.sort !== "descending")
  ) {
    console.info(
      "[POST][RES]: @api/company/orders\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    const orders = await Order.find({
      manufacturer: req.session.username,
    })
      .populate("product")
      .sort(`${req.body.sort === "descending" ? "orderedOn" : "-orderedOn"}`)
      .exec();

    response.entries = orders.map((order) => {
      return {
        _id: order._id,
        manufacturer: order.manufacturer,
        orderedBy: order.orderedBy,
        orderedOn: order.orderedOn,
        product: order.product.name,
        quantity: order.quantity,
        groupOrderId: order.groupOrderId,
        accepted: order.accepted,
        status: order.status,
        destinationId: order.destinationId,
        deliverTo: order.deliverTo,
      };
    });

    console.info(
      "[POST][RES]: @api/company/orders\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );
    res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/orders\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving company orders.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//GET @api/company/orders/by-status
exports.getOrdersBacklogByStatus = async (req, res) => {
  let response = { entries: [] };

  try {
    const orders = await Order.find({
      manufacturer: req.session.username,
    })
      .populate("product")
      .sort("-status -orderedOn")
      .exec();

    response.entries = orders.map((order) => {
      return {
        _id: order._id,
        manufacturer: order.manufacturer,
        orderedBy: order.orderedBy,
        orderedOn: order.orderedOn,
        product: order.product.name,
        quantity: order.quantity,
        groupOrderId: order.groupOrderId,
        accepted: order.accepted,
        status: order.status,
        destinationId: order.destinationId,
        deliverTo: order.deliverTo,
      };
    });

    console.info(
      "[POST][RES]: @api/company/orders/by-status\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );
    res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/orders/by-status\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving company orders.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//GET @api/company/couriers
exports.getCouriers = async (req, res) => {
  let response = { couriers: [], maxCount: MAX_COURIER_COUNT };
  let couriers;

  try {
    couriers = await Courier.find({
      registeredTo: req.session.username,
    }).exec();

    //initialize and fetch new couriers if insufficient ammount of couriers exist
    if (couriers.length < MAX_COURIER_COUNT) {
      for (let i = couriers.length; i < MAX_COURIER_COUNT; i++) {
        const courier = await Courier.create({
          registeredTo: req.session.username,
          orders: [],
          deliveryDate: null,
          returnDate: null,
          available: true,
          status: "idle",
        });

        if (!courier) {
          throw new Error("On-Save-Exception: Failed to save document.");
        }
      }

      couriers = await Courier.find({
        registeredTo: req.session.username,
      }).exec();
      if (!couriers) {
        throw new Error("Item-Not-Found-Exception: Courier.");
      }
    }

    response.couriers = couriers;
    console.info(
      "[POST][RES]: @api/company/couriers\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/couriers\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving couriers.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/company/orders/accept
exports.acceptOrder = async (req, res) => {
  let response = { success: false, returnDate: null, deliveryDate: null };

  if (!req.body.courierId || !req.body.groupOrderId) {
    console.info(
      "[POST][RES]: @api/company/orders/accept\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  let courier;
  let orders;
  let user;
  let errorEncounteredFlag = false;

  //fetch courier and order documents
  try {
    courier = await Courier.findById(req.body.courierId).exec();
    if (!courier) {
      throw new Error("Item-Not-Found-Exception: Courier.");
    }

    orders = await Order.find({
      groupOrderId: req.body.groupOrderId,
    }).exec();
    if (!orders) {
      throw new Error("Item-Not-Found-Exception: Order.");
    }

    user = await Users.findOne({
      username: req.session.username,
    })
      .populate("info")
      .exec();
    if (!user) {
      throw new Error("Item-Not-Found-Exception: User.");
    }
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/orders/accept\nDatabase-Query-Exception: Query call failed.\nQuery: Fetching documents from multiple collections.\nError-Log:\n",
      err
    );
    errorEncounteredFlag = true;
    res.status(500).json(response);
  }

  //set courier instructions
  try {
    //update delivery related fields in orders and attach them to courier
    orders.forEach((order, index, array) => {
      array[index].accepted = true;
      array[index].status = "in-transit";
      courier.orders.push(order._id);
    });

    //URL encode locations
    const source = encodeURI(user.info.hq)
      .replace(",", "%2C")
      .replace(" ", "%20");
    const destination = encodeURI(orders[0].deliverTo)
      .replace(",", "%2C")
      .replace(" ", "%20");

    //geocode locations into coordinates using TomTom Search API
    const sourceRequestOptions = {
      uri: `${SEARCH_API}/${source}.json?typeahead=true&key=${TOM_TOM_API_KEY}`,
      headers: { Accept: "application/json " },
      json: true,
    };
    const destinationRequestOptions = {
      uri: `${SEARCH_API}/${destination}.json?typeahead=true&key=${TOM_TOM_API_KEY}`,
      headers: { Accept: "application/json " },
      json: true,
    };
    const sourceResponse = await request(sourceRequestOptions);
    const destinationResponse = await request(destinationRequestOptions);
    const sourcePosition = sourceResponse.results[0].position;
    const destinationPosition = destinationResponse.results[0].position;

    //calculate approximate travel time using TomTom Routing API
    const waypointsGeocodeString = encodeURI(
      `${sourcePosition.lat},${sourcePosition.lon}:${destinationPosition.lat},${destinationPosition.lon}`
    )
      .replace(",", "%2C")
      .replace(":", "	%3A")
      .replace("\t", "");

    const travelOptions = {
      uri: `${ROUTING_API}/${waypointsGeocodeString}/json?routeType=fastest&avoid=unpavedRoads&travelMode=truck&key=${TOM_TOM_API_KEY}`,
      headers: { Accept: "application/json " },
      json: true,
    };
    const travelResponse = await request(travelOptions);
    const departureTime = new Date(
      travelResponse.routes[0].summary.departureTime
    );
    const arrivalTime = new Date(travelResponse.routes[0].summary.arrivalTime);
    const travelTime = arrivalTime.getTime() - departureTime.getTime();
    const returnDate = new Date(arrivalTime.getTime() + travelTime);

    //bind courier instructions
    courier.deliveryDate = arrivalTime;
    courier.returnDate = returnDate;
    courier.available = false;
    courier.status = "delivering";

    //attach to response
    response.deliveryDate = arrivalTime;
    response.returnDate = returnDate;
  } catch (err) {
    console.error(
      "[ERROR]: @api/company/orders/accept\nExternal-Request-Exception: External API call failed.\nAPI: TomTom API.\nError-Log:\n",
      err
    );
    errorEncounteredFlag = true;
    res.status(500).json(response);
  }

  //save changes to database documents
  try {
    if (errorEncounteredFlag) {
      throw new Error(
        "Erronous-Data-Exception: Cannot save data after errors have been detected."
      );
    }

    const courierSaved = await courier.save();
    if (!courierSaved) {
      throw new Error(
        "On-Save-Exception: Failed to save document to Couriers collection."
      );
    }

    for (let i = 0; i < orders.length; i++) {
      const orderSaved = await orders[i].save();
      if (!orderSaved) {
        throw new Error(
          "On-Save-Exception: Failed to save document to Orders collection."
        );
      }
    }

    //finalize response
    response.success = true;
    console.info(
      "[POST][RES]: @api/company/orders/accept\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/orders/accept\nDatabase-Query-Exception: Query call failed.\nQuery: Saving documents.\nError-Log:\n",
      err
    );
    if (!errorEncounteredFlag) {
      res.status(500).json(response);
    }
  }
};

//POST @api/company/orders/reject
exports.rejectOrder = async (req, res) => {
  let response = { success: false };

  if (!req.body.groupOrderId) {
    console.info(
      "[POST][RES]: @api/company/orders/reject\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    const docs = await Order.updateMany(
      {
        manufacturer: req.session.username,
        groupOrderId: req.body.groupOrderId,
      },
      { $set: { accepted: false, status: "cancelled" } }
    ).exec();

    if (!docs) {
      throw new Error("On-Update-Exception: Failed to update documents.");
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/company/orders/reject\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/orders/reject\nDatabase-Query-Exception: Query call failed.\nQuery: Updating orders.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/company/couriers/deliver
exports.deliverOrder = async (req, res) => {
  let response = { success: false };

  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/company/couriers/deliver\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    //fetch documents
    const courier = await Courier.findById(req.body._id).exec();
    if (!courier) {
      throw new Error("Item-Not-Found-Exception: Courier.");
    }

    const orders = await Order.find({
      _id: { $in: courier.orders },
    })
      .populate("product")
      .exec();
    if (orders.length === 0) {
      throw new Error("Item-Not-Found-Exception: Order.");
    }

    const warehouse = await Warehouse.findOne({
      _id: orders[0].destinationId,
    }).exec();
    if (!warehouse) {
      throw new Error("Item-Not-Found-Exception: Warehouse.");
    }

    //update documents
    orders.forEach((order, orderIndex) => {
      //update warehouse
      const itemIndex = warehouse.items.findIndex(
        (item) => item.name === order.product.name
      );
      if (itemIndex < 0) {
        let warehouseItem = {
          _id: mongoose.Types.ObjectId(),
          manufacturer: order.manufacturer,
          type: order.product.type,
          quantity: order.quantity,
          name: order.product.name,
        };

        if (warehouseItem.type === "seedling") {
          warehouseItem.daysToGrow = order.product.daysToGrow;
        } else if (warehouseItem.type === "fertilizer") {
          warehouseItem.accelerateGrowthBy = order.product.accelerateGrowthBy;
        }

        warehouse.items.push(warehouseItem);
      } else {
        warehouse.items[itemIndex].quantity += order.quantity;
      }

      //update orders
      orders[orderIndex].status = "delivered";
    });

    //save changes
    const warehouseSaved = await warehouse.save();
    if (!warehouseSaved) {
      throw new Error(
        "On-Save-Exception: Failed to save document to Warehouses collection."
      );
    }

    for (let i = 0; i < orders.length; i++) {
      const orderSaved = await orders[i].save();
      if (!orderSaved) {
        throw new Error(
          "On-Save-Exception: Failed to save document to Orders collection."
        );
      }
    }

    //update courier
    courier.status = "returning";
    const courierSaved = await courier.save();
    if (!courierSaved) {
      throw new Error(
        "On-Save-Exception: Failed to save document to Couriers collection."
      );
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/company/couriers/deliver\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/couriers/deliver\nDatabase-Query-Exception: Query call failed.\nQuery: Updating documents.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/company/couriers/done
exports.returnToHQ = async (req, res) => {
  let response = { success: false };

  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/company/couriers/done\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
    );
    return res.status(400).json(response);
  }

  try {
    const courier = await Courier.findById(req.body._id).exec();
    if (!courier) {
      throw new Error("Item-Not-Found-Exception: Courier.");
    }

    courier.orders = [];
    courier.deliveryDate = null;
    courier.returnDate = null;
    courier.available = true;
    courier.status = "idle";

    const courierSaved = await courier.save();
    if (!courierSaved) {
      throw new Error(
        "On-Save-Exception: Failed to save document to Couriers collection."
      );
    }

    response.success = true;
    console.info(
      "[POST][RES]: @api/company/couriers/done\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/company/couriers/done\nDatabase-Query-Exception: Query call failed.\nQuery: Updating documents.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};
