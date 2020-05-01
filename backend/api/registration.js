const request = require("request-promise-native");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  WorkerRegistrationRequestSchema,
} = require("../models/registration_requests");

const CAPTCHA_SECRET_KEY = "6LdwaO0UAAAAAAzU6d79VVKYDSJM-i0QBNeo8t5J";
var WorkerRegistrationRequest = null;

const compileSchemas = () => {
  if (WorkerRegistrationRequest == null) {
    WorkerRegistrationRequest = mongoose.model(
      "WorkerRegistrationRequest",
      WorkerRegistrationRequestSchema
    );
  }
};

const hashPassword = async (password) => {
  let saltValue = "";
  let result = "";
  let successful = false;
  try {
    saltValue = await bcrypt.genSalt();
    result = await bcrypt.hash(password, saltValue);
    successful = true;
  } catch (err) {
    console.error(
      "[ERROR]: @api/registration/worker\nPassword-Hashing-Exception: Password hashing failed.\nError-Log:\n",
      err
    );
  } finally {
    return JSON.stringify({
      salt: saltValue,
      hash: result,
      success: successful,
    });
  }
};

const usernameLookup = (identifier) => {
  return new Promise((resolve, reject) => {
    WorkerRegistrationRequest.findOne(
      { username: identifier },
      "username",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const persistRegistrationRequest = async (document) => {
  let success = false;
  try {
    await document.save((err, doc) => {
      if (err) {
        console.error(
          `[ERROR][DB]: @api/registration/worker\nOn-Save-Exception: Saving to database failed.\nDocument:\n${doc}\nError-Log:\n`,
          err
        );
      }
    });
    success = true;
  } catch (err) {
    console.error(
      `[ERROR][DB]: @api/registration/worker\nOn-Save-Exception: Saving to database failed.\nDocument:\n${newRegistrationRequest}\nError-Log:\n`,
      err
    );
  } finally {
    return success;
  }
};

exports.processWorkerRegistrationRequest = async (req, res) => {
  console.info("[POST]: @api/registration\nRequest:\n", req.body);
  let response = { captchaOK: false, usernameOK: false, success: false };
  let responseSent = false;

  //bad header
  if (
    req.body.token === undefined ||
    req.body.token === "" ||
    req.body.token === null ||
    req.body.user === undefined ||
    req.body.user === null
  ) {
    console.info(
      "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 400.\nResult-Origin: HTTP header.\nResponse:\n",
      response
    );
    responseSent = true;
    return res.status(400).json(response);
  }

  //verify CAPTCHA
  const verifyCaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${req.body.token}`;
  await request(verifyCaptchaURL, (err, res, body) => {
    if (err) {
      console.error(
        "[ERROR]: @api/registration/worker\nExternal-API-Call-Exception: reCAPTCHA failed.\nOperation: Verify.\nError-Log:\n",
        err
      );
      if (responseSent === false) {
        responseSent = true;
        return res.status(500).json(response);
      }
    } else {
      const resBody = JSON.parse(body);
      if (resBody.success === false) {
        console.info(
          "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 200.\nResult-Origin: reCAPTCHA.\nResponse:\n",
          response
        );
        if (responseSent === false) {
          responseSent = true;
          return res.status(200).json(response);
        }
      } else {
        response.captchaOK = true;
      }
    }
  });

  //username availability
  compileSchemas();
  try {
    const result = await usernameLookup(req.body.user.username);
    if (result) {
      console.info(
        "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 200.\nResult-Origin: Username lookup.\nResponse:\n",
        response
      );
      if (responseSent === false) {
        responseSent = true;
        return res.status(200).json(response);
      }
    } else {
      response.usernameOK = true;
    }
  } catch (err) {
    console.error(
      "[ERROR][DB]: @api/registration/worker\nDatabase-Query-Exception: Query call failed.\nQuery: WorkerRegistrationRequest.findOne\nError-Log:\n",
      err
    );
    if (responseSent === false) {
      responseSent = true;
      return res.status(500).json(response);
    }
  }

  //hash the password
  let saltValue = "";
  let hashedPassword = "";
  const hashingResult = JSON.parse(await hashPassword(req.body.user.password));
  if (hashingResult.success === false) {
    console.info(
      "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 500.\nResult-Origin: Password hashing.\nResponse:\n",
      response
    );
    if (responseSent === false) {
      responseSent = true;
      return res.status(500).json(response);
    }
  } else {
    saltValue = hashingResult.salt;
    hashedPassword = hashingResult.hash;
  }

  //submit new registration request to db
  const newRegistrationRequest = new WorkerRegistrationRequest({
    name: req.body.user.name,
    surname: req.body.user.surname,
    username: req.body.user.username,
    password: hashedPassword,
    salt: saltValue,
    birthdate: new Date(req.body.user.birthdate),
    birthplace: req.body.user.birthplace,
    cellphone: req.body.user.cellphone,
    email: req.body.user.email,
  });

  let persistSuccess = false;
  if (
    response.captchaOK === true &&
    response.usernameOK === true &&
    responseSent === false
  ) {
    persistSuccess = await persistRegistrationRequest(newRegistrationRequest);
  }

  if (persistSuccess) {
    response.success = true;
    console.info(
      "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 200.\nResult-Origin: End of function.\nResponse:\n",
      response
    );
    responseSent = true;
    return res.status(200).json(response);
  } else if (responseSent === false) {
    console.info(
      "[POST][RES]: @api/registration/worker\nAPI-Call-Result: 500.\nResult-Origin: Persisting request.\nResponse:\n",
      response
    );
    responseSent = true;
    return res.status(500).json(response);
  }
};
