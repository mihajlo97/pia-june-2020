//dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//modules
const registration = require("./api/registration");

//config
const PORT = process.env.PORT || 3000;
const dbURI = "mongodb://127.0.0.1/PIA";

//start server
const app = express();
app.listen(PORT, () => {
  console.info(`[APP]: Server running @localhost:${PORT}.`);
});

//establish db connection
mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.error(
        "[APP][DB]: Database-Connection-Exception: Connection failed."
      );
      console.error(err);
    } else {
      console.info("[APP][DB]: Database-Connection: Success.");
    }
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "[ERROR][DB]:\n"));

//set up middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//===============
//    [ API ]
//===============

//registration
app.post(
  "/api/registration/worker",
  registration.processWorkerRegistrationRequest
);
