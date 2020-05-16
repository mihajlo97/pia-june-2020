const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { UserSchema } = require("../models/users");

//[DB-COLLECTIONS]
const Users = mongoose.model("User", UserSchema);

//[MIDDLEWARE]
exports.hasSession = (req, res, next) => {
  let response = { hasSession: false };
  if (req.session && req.session.user) {
    next();
  } else {
    console.info(
      "[MIDWARE][RES]: @hasSession\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(403).json(response);
  }
};

//[API-RESPONSES]
//>POST @api/login
exports.loginUser = async (req, res) => {
  let response = { userOK: false, passOK: false, username: "", role: "" };

  //validate request
  if (!req.body.username || !req.body.password || req.session.username) {
    console.info(
      "[POST][RES]: @api/login\nAPI-Call-Result: 400.\nResult-Origin: Request params.\nResponse:\n",
      response
    );
    return res.status(400).json(response);
  }

  //lookup username
  let user;
  try {
    user = await Users.findOne({
      username: req.body.username,
    })
      .select("username password salt role")
      .exec();
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/login\nDatabase-Query-Exception: Query call failed.\nQuery: Users.findOne\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
  if (!user) {
    console.info(
      "[POST][RES]: @api/login\nAPI-Call-Result: 403.\nResult-Origin: Username lookup.\nResponse:\n",
      response
    );
    return res.status(404).json(response);
  } else {
    response.userOK = true;
  }

  //compare passwords
  let password;
  try {
    password = await bcrypt.hash(req.body.password, user.salt);
  } catch (err) {
    console.error(
      "[ERROR]: @api/login\nHashing-Exception: Hashing failed.\nError-Log:\n",
      err
    );
    return res.status(500).json(response);
  }
  if (password !== user.password) {
    console.info(
      "[POST][RES]: @api/login\nAPI-Call-Result: 403.\nResult-Origin: Password comparison.\nResponse:\n",
      response
    );
    return res.status(403).json(response);
  } else {
    response.passOK = true;
  }

  //start session
  if (response.userOK && response.passOK) {
    req.session.username = user.username;
    response.username = user.username;
    response.role = user.role;
    console.info(
      "[POST][RES]: @api/login\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(200).json(response);
  } else {
    console.error(
      "[ERROR]: @api/login\nAPI-Call-Result: 500.\nResult-Origin: End of call.\nResponse:\n",
      response
    );
    return res.status(500).json(response);
  }
};

//>GET @api/login
exports.userLoggedIn = (req, res) => {
  let response = { isLoggedIn: false };
  response.isLoggedIn = req.session.username ? true : false;
  console.info(
    "[GET][RES]: @api/login\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
    response
  );
  return res.status(200).json(response);
};

//POST @api/logout
exports.logoutUser = (req, res) => {
  let response = { logoutSuccess: false };
  req.session.destroy((err) => {
    if (err) {
      console.error(
        "[ERROR]: @api/login\nAPI-Call-Result: 500.\nResult-Origin: End of call.\nResponse:\n",
        response
      );
      return res.status(500).json(response);
    } else {
      response.logoutSuccess = true;
      console.info(
        "[POST][RES]: @api/logout\nAPI-Call-Result: 200.\nResult-Origin: End of call.\nResponse:\n",
        response
      );
      return res.status(200).json(response);
    }
  });
};
