const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const SessionStore = require("connect-mongo")(session);

//[MODULES]
const registration = require("./api/registration");

//[CONFIG]
const PORT = process.env.PORT || 3000;
const dbURI = "mongodb://127.0.0.1/PIA";
const clientOrigin = "http://localhost:4200";
const sessionSecret = "PIA_EXPRESS_SESSION_KEY#060520";

//[START-UP]
const app = express();
app.listen(PORT, () => {
  console.info(`[APP]: Server running @localhost:${PORT}.`);
});

//[DB-CONNECT]
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

//[MIDDLEWARE]
//>Cross-Origin-Resource-Sharing
app.use(
  cors({
    origin: [clientOrigin],
    credentials: true,
  })
);
//>Request-Processing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//>Session-Management
app.use(
  session({
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    store: new SessionStore({
      url: dbURI,
      touchAfter: 24 * 60 * 60,
    }),
  })
);

//===============
//    [ API ]
//===============

//[REGISTRATION]
app.post(
  "/api/registration/worker",
  registration.processWorkerRegistrationRequest
);

app.post(
  "/api/registration/company",
  registration.processCompanyRegistrationRequest
);
