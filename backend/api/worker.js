const mongoose = require("mongoose");
const worker = require("../models/worker");
const users = require("../models/users");

const WATER_DEFAULT = 200;
const TEMPERATURE_DEFAULT = 18.0;

//[DB-COLLECTIONS]
const Hothouse = mongoose.model("Hothouses", worker.HothouseSchema);
const HothouseSpot = mongoose.model("HothouseSpots", worker.HothouseSpotSchema);
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
        "[MIDWARE][RES]: @worker: checkWorkerPermission\nMidware-Result: 403.\nResult-Origin: Request params.\nResponse:\n",
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

  for (let i = 1; i <= capacity; i++) {
    hothouse.spots.push({
      position: i,
      occupied: false,
      lastOccupiedOn: null,
    });
  }

  hothouse
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
        "[ERROR][DB]: @api/worker/hothouse/create\nDatabase-Query-Exception: Query call failed.\nQuery: Create hothouse.\nError-Log:\n",
        err
      );
      return res.status(500).json(response);
    });
};
