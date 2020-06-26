const mongoose = require("mongoose");
const product = require("../models/product");
const company = require("../models/company");
const users = require("../models/users");

//[DB-COLLECTIONS]
const Product = mongoose.model("Products", product.ProductSchema);
const ProductComment = mongoose.model(
  "ProductComments",
  product.ProductCommentSchema
);
const Order = mongoose.model("Orders", company.OrderSchema);
const DeliveryAgent = mongoose.model(
  "DeliveryAgents",
  company.DeliveryAgentSchema
);
const Users = mongoose.model("Users", users.UserSchema);

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

//[API]

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
      .sort(`${req.body.sort === "descending" ? "-orderedOn" : "orderedOn"}`)
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
      "[GET][RES]: @api/company/orders\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
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
