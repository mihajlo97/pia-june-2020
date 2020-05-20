const mongoose = require("mongoose");
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

  //write to stream worker registration requests
  const workerRole = "worker";
  for await (const doc of WorkerItems.find()) {
    if (doc) {
      pendingItem.username = doc.username;
      pendingItem.email = doc.email;
      pendingItem.role = workerRole;

      res.write(`${JSON.stringify(pendingItem)},`);
    }
  }

  //write to stream company registration requests
  const companyRole = "company";
  const cursor = CompanyItems.find().cursor();
  let doc = await cursor.next();
  let docNext;
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
};

//POST @api/admin/pending
exports.acceptOrRejectPendingRequest = async (req, res) => {
  let response = { actionSuccess: false };

  if (
    !req.body.username ||
    !req.body.role ||
    req.body.acceptItem === null ||
    req.body.acceptItem === undefined
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

  //finalize response for action reject account
  if (req.body.acceptItem === false) {
    response.actionSuccess = true;
    console.info(
      "[POST][RES]: @api/admin/pending\nAPI-Call-Result: 200.\nResult-Origin: Reject account.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  }

  //on action account accept, add account to users in the db and store details in appropriate collection
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

    console.log("[DEBUG]: Account:", account);

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
