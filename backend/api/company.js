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

//POST @api/catalog/product
exports.getProduct = async (req, res) => {
  let response = { product: null };

  if (!req.body._id) {
    console.info(
      "[POST][RES]: @api/catalog/product\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
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
      "[POST][RES]: @api/catalog/product\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/catalog/product\nDatabase-Query-Exception: Query call failed.\nQuery: Fetching product.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/catalog/product/availability
exports.toggleProductAvailability = async (req, res) => {
  if (
    !req.body._id ||
    req.body.available === undefined ||
    req.body.available === null
  ) {
    console.info(
      "[POST][RES]: @api/catalog/product/availability\nAPI-Call-Result: 400.\nResult-Origin: Request params.\n"
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
      "[POST][RES]: @api/catalog/product/availability\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nUpdated:\n",
      { availability: req.body.available }
    );
    return res.status(200).end();
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/catalog/product/availability\nDatabase-Query-Exception: Query call failed.\nQuery: Updating product.\nError-Log:\n",
      err
    );
    res.status(500).end();
  }
};
