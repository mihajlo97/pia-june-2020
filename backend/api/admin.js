const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const users = require("../models/users");
const registration = require("../models/registration_requests");

//[DB-COLLECTIONS]
const Users = mongoose.model("Users", users.UserSchema);
const WorkerItems = mongoose.model(
  "WorkerRegistrationRequest",
  registration.WorkerRegistrationRequestSchema
);
const CompanyItems = mongoose.model(
  "CompanyRegistrationRequests",
  registration.CompanyRegistrationRequestSchema
);
const AdminInfo = mongoose.model("AdminInfo", users.AdminInfoSchema);
const WorkerInfo = mongoose.model("WorkerInfo", users.WorkerInfoSchema);
const CompanyInfo = mongoose.model("CompanyInfo", users.CompanyInfoSchema);
const userRoles = ["none", "worker", "company", "admin"];

//[MIDDLEWARE]
exports.checkAdminPrivilege = async (req, res, next) => {
  let response = {
    error:
      "Insufficient-Permission-Exception: This user does not have permission to make this request.",
  };
  if (req.session && req.session.username) {
    const user = await Users.findOne({
      username: req.session.username,
      role: "admin",
    }).exec();

    if (user) {
      next();
    } else {
      console.info(
        "[MIDWARE][RES]: @admin: checkAdminPrivilege\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
        response
      );
      return res.status(403).json(response);
    }
  } else {
    console.info(
      "[MIDWARE][RES]: @admin: checkAdminPrivilege\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(403).json(response);
  }
};

//[HELPER-FUNCTIONS]
const isInvalidRole = (role) => {
  const itemAt = userRoles.findIndex((value, index, array) => {
    return array[index] === role;
  });
  return itemAt < 0;
};

//[API]

//GET @api/admin/pending
exports.getPendingRequests = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");
  let pendingItem = {
    username: "",
    email: "",
    role: "",
  };

  try {
    //write to stream worker registration requests
    const workerRole = "worker";
    let cursor = WorkerItems.find()
      .collation({ locale: "en" })
      .sort("username")
      .cursor();
    let doc = await cursor.next();
    let docNext;
    let itemsWritten = 0;
    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        pendingItem.username = doc.username;
        pendingItem.email = doc.email;
        pendingItem.role = workerRole;
        itemsWritten++;

        res.write(JSON.stringify(pendingItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    if (itemsWritten > 0) {
      res.write(",");
    }

    //write to stream company registration requests
    const companyRole = "company";
    cursor = CompanyItems.find()
      .collation({ locale: "en" })
      .sort("username")
      .cursor();
    doc = await cursor.next();
    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        pendingItem.username = doc.username;
        pendingItem.email = doc.email;
        pendingItem.role = companyRole;

        res.write(JSON.stringify(pendingItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[GET][RES]: @api/admin/pending\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );
    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/pending\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving registration requests.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @api/admin/pending
exports.acceptOrRejectPendingRequest = async (req, res) => {
  let response = { actionSuccess: false };

  //handle bad request
  if (
    !req.body.username ||
    !req.body.role ||
    isInvalidRole(req.body.role) ||
    !("acceptItem" in req.body)
  ) {
    console.info(
      "[POST][RES]: @api/admin/pending\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  const accountRole = req.body.role;
  let account;
  let infoCollection;

  //retrieve account details and remove from pending requests
  try {
    switch (accountRole) {
      case "worker": {
        account = await WorkerItems.findOneAndRemove({
          username: req.body.username,
        }).exec();
        infoCollection = "WorkerInfo";
        break;
      }
      case "company": {
        account = await CompanyItems.findOneAndRemove({
          username: req.body.username,
        }).exec();
        infoCollection = "CompanyInfo";
        break;
      }
      default: {
        console.info(
          "[POST][RES]: @api/admin/pending\nAPI-Call-Result: 400.\nResult-Origin: Invalid account role.\nResponse:\n",
          response
        );
        return res.status(400).json(response);
      }
    }
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/pending\nDatabase-Query-Exception: Query call failed.\nQuery: Removing pending request.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }

  //finalize response for action reject registration request
  if (req.body.acceptItem === false) {
    response.actionSuccess = true;
    console.info(
      "[POST][RES]: @api/admin/pending\nAPI-Call-Result: 200.\nResult-Origin: Reject account.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  }

  //on action registration accept, add account to users in the db and store details in appropriate collection
  try {
    let accountDetails;

    //insert account details into appropriate collection
    switch (accountRole) {
      case "worker": {
        accountDetails = await WorkerInfo.create({
          name: account.name,
          surname: account.surname,
          birthdate: account.birthdate,
          birthplace: account.birthplace,
          cellphone: account.cellphone,
          email: account.email,
        });
        break;
      }
      case "company": {
        accountDetails = await CompanyInfo.create({
          name: account.name,
          foundingDate: account.foundingDate,
          hq: account.hq,
          email: account.email,
        });
        break;
      }
    }

    //insert account credentials into Users collection
    const user = await Users.create({
      username: account.username,
      password: account.password,
      salt: account.salt,
      role: accountRole,
      info: accountDetails._id,
      infoSelector: infoCollection,
    });

    if (user) {
      response.actionSuccess = true;
      console.info(
        "[POST][RES]: @api/admin/pending\nAPI-Call-Result: 200.\nResult-Origin: Accept account.\nResponse:\n",
        response
      );
      return res.status(200).json(response);
    }
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/pending\nDatabase-Query-Exception: Query call failed.\nQuery: Adding account to userbase.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
};

//GET @api/admin/users
exports.getAllUsers = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");
  let userItem = {
    username: "",
    role: "",
  };

  try {
    //write to stream user item
    const cursor = Users.find()
      .collation({ locale: "en" })
      .sort("username")
      .cursor();
    let doc = await cursor.next();
    let docNext;
    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        userItem.username = doc.username;
        userItem.role = doc.role;

        res.write(JSON.stringify(userItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[GET][RES]: @api/admin/users\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );

    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/users\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving users.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @api/admin/user/details
exports.getUserDetails = async (req, res) => {
  let response = {
    email: "",
  };
  const userRole = req.body.role;

  //handle invalid request format
  if (!req.body.username || !req.body.role || isInvalidRole(req.body.role)) {
    console.info(
      "[POST][RES]: @api/admin/users/user\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  try {
    const user = await Users.findOne({
      username: req.body.username,
    })
      .populate("info")
      .exec();
    switch (userRole) {
      case "admin": {
        response.email = user.info.email;
      }
      case "worker": {
        response.name = user.info.name;
        response.surname = user.info.surname;
        response.birthdate = user.info.birthdate;
        response.birthplace = user.info.birthplace;
        response.cellphone = user.info.cellphone;
        response.email = user.info.email;
      }
      case "company": {
        response.name = user.info.name;
        response.foundingDate = user.info.foundingDate;
        response.hq = user.info.hq;
        response.email = user.info.email;
      }
    }

    console.info(
      "[POST][RES]: @api/admin/user/details\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/user/details\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving user details.\nError-Log:\n",
      err
    );
    res.status(500).json(response);
  }
};

//POST @api/admin/users/search
exports.searchUsers = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");
  let userItem = {
    username: "",
    role: "",
  };
  const searchByRole = req.body.role;

  //handle invalid request format
  const MINIMUM_CHARS = 2;
  if (
    !req.body.partial ||
    !req.body.role ||
    isInvalidRole(req.body.role) ||
    req.body.partial.length < MINIMUM_CHARS
  ) {
    console.info(
      "[POST][RES]: @api/admin/users/search\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      []
    );
    return res.status(400).end("]");
  }

  try {
    //perform user search
    let cursor;
    if (searchByRole === "none") {
      cursor = Users.find({
        username: { $regex: req.body.partial, $options: "i" },
      })
        .collation({ locale: "en" })
        .sort("username")
        .cursor();
    } else {
      cursor = Users.find({
        username: { $regex: req.body.partial, $options: "i" },
        role: searchByRole,
      })
        .collation({ locale: "en" })
        .sort("username")
        .cursor();
    }
    let doc = await cursor.next();
    let docNext;
    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        userItem.username = doc.username;
        userItem.role = doc.role;

        res.write(JSON.stringify(userItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[POST][RES]: @api/admin/users/search\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );

    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/users/search\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving matching users.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @api/admin/users/role
exports.getUsersByRole = async (req, res) => {
  //setup response stream as array of JSON objects
  res.set("Content-Type", "application/json");
  res.write("[");
  let userItem = {
    username: "",
    role: "",
  };

  //handle invalid request format
  if (!req.body.role || isInvalidRole(req.body.role)) {
    console.info(
      "[POST][RES]: @api/admin/users/search\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      []
    );
    return res.status(400).end("]");
  }

  try {
    //get users that match the querried role
    const cursor = Users.find({
      role: req.body.role,
    })
      .collation({ locale: "en" })
      .sort("username")
      .cursor();
    let doc = await cursor.next();
    let docNext;
    while (doc != null) {
      docNext = await cursor.next();
      if (doc) {
        userItem.username = doc.username;
        userItem.role = doc.role;

        res.write(JSON.stringify(userItem));
      }
      if (docNext) {
        res.write(",");
      }
      doc = docNext;
    }

    console.info(
      "[POST][RES]: @api/admin/users/role\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse: Stream-Write-OK."
    );

    res.end("]");
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/users/role\nDatabase-Query-Exception: Query call failed.\nQuery: Retrieving users of requested role.\nError-Log:\n",
      err
    );
    res.status(500).end("{}]");
  }
};

//POST @api/admin/users/delete
exports.deleteUser = async (req, res) => {
  let response = { deleteSuccess: false };

  //handle bad request
  if (!req.body.username || !req.body.role || isInvalidRole(req.body.role)) {
    console.info(
      "[POST][RES]: @api/admin/users/delete\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  const userRole = req.body.role;
  try {
    let user = await Users.findOneAndRemove({
      username: req.body.username,
    });
    let details;
    switch (userRole) {
      case "worker": {
        await WorkerInfo.findByIdAndRemove(user.info);
        break;
      }
      case "company": {
        await CompanyInfo.findByIdAndRemove(user.info);
        break;
      }
      case "admin": {
        await AdminInfo.findByIdAndRemove(user.info);
        break;
      }
    }
    response.deleteSuccess = true;
    console.info(
      "[POST][RES]: @api/admin/users/delete\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/users/delete\nDatabase-Query-Exception: Query call failed.\nQuery: Removing user.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
};

//POST @api/admin/user/edit
exports.editUser = async (req, res) => {
  let response = { editSuccess: false };

  //handle bad request
  if (
    !req.body.username ||
    !req.body.role ||
    isInvalidRole(req.body.role) ||
    !req.body.details
  ) {
    console.info(
      "[POST][RES]: @api/admin/user/edit\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  const userRole = req.body.role;
  try {
    let user = await Users.findOne({
      username: req.body.username,
    });
    let details;

    switch (userRole) {
      case "worker": {
        details = await WorkerInfo.findById(user.info);
        details.name = req.body.details.name;
        details.surname = req.body.details.surname;
        details.birthdate = req.body.details.birthdate;
        details.birthplace = req.body.details.birthplace;
        details.cellphone = req.body.details.cellphone;
        details.email = req.body.details.email;
        break;
      }
      case "company": {
        details = await CompanyInfo.findById(user.info);
        details.name = req.body.details.name;
        details.foundingDate = req.body.details.foundingDate;
        details.hq = req.body.details.hq;
        details.email = req.body.details.email;
        break;
      }
      case "admin": {
        details = await AdminInfo.findById(user.info);
        details.email = req.body.details.email;
        break;
      }
    }
    await details.save();
    response.editSuccess = true;
    console.info(
      "[POST][RES]: @api/admin/user/edit\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/user/edit\nDatabase-Query-Exception: Query call failed.\nQuery: Editing user.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
};

//POST @api/admin/user
exports.createNewUser = async (req, res) => {
  let response = { usernameTaken: true, createSuccess: false };

  //handle bad request
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.role ||
    isInvalidRole(req.body.role) ||
    !req.body.details
  ) {
    console.info(
      "[POST][RES]: @api/admin/user\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  const userRole = req.body.role;
  try {
    const usernameCheck = await Users.findOne({
      username: req.body.username,
    }).exec();

    if (usernameCheck) {
      console.info(
        "[POST][RES]: @api/admin/user\nAPI-Call-Result: 200.\nResult-Origin: Username taken.\nResponse:\n",
        response
      );
      return res.status(200).json(response);
    } else {
      response.usernameTaken = false;
    }

    let details;
    let infoCollection;

    switch (userRole) {
      case "worker": {
        details = await WorkerInfo.create({
          name: req.body.details.name,
          surname: req.body.details.surname,
          birthdate: req.body.details.birthdate,
          birthplace: req.body.details.birthplace,
          cellphone: req.body.details.cellphone,
          email: req.body.details.email,
        });
        infoCollection = "WorkerInfo";
        break;
      }
      case "company": {
        details = await CompanyInfo.create({
          name: req.body.details.name,
          foundingDate: req.body.details.foundingDate,
          hq: req.body.details.hq,
          email: req.body.details.email,
        });
        infoCollection = "CompanyInfo";
        break;
      }
      case "admin": {
        details = await AdminInfo.create({
          email: req.body.details.email,
        });
        infoCollection = "AdminInfo";
      }
    }

    let saltValue;
    let passwordHash;
    try {
      saltValue = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(req.body.password, saltValue);
    } catch (err) {
      console.error(
        "[ERROR]: @api/admin/user\nPassword-Hashing-Exception: Password hashing failed.\nError-Log:\n",
        err
      );
      return res.status(500).json(response);
    }

    const user = await Users.create({
      username: req.body.username,
      password: passwordHash,
      salt: saltValue,
      role: userRole,
      info: details._id,
      infoSelector: infoCollection,
    });

    if (user) {
      response.createSuccess = true;
      console.info(
        "[POST][RES]: @api/admin/user\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
        response
      );
      return res.status(200).json(response);
    } else {
      console.info(
        "[POST][RES]: @api/admin/user\nAPI-Call-Result: 500.\nResult-Origin: Creating new user.\nResponse:\n",
        response
      );
      return res.status(500).json(response);
    }
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/admin/user/edit\nDatabase-Query-Exception: Query call failed.\nQuery: Editing user.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
};
